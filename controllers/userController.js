const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Token = require('../models/token')
const Event = require('../models/event')
const UserService = require('../service/userService')
const UserDto = require('../dto/user-dto')
const TokenService = require('../service/tokenService')
const uuid = require('uuid');
const mailService = require("../service/mailService");
const userService = require('../service/userService')
const user = require('../models/user')


class userController {

    async registration(req, res) {
        try {
            const {email, password, role} = req.body
            if(!email || !password) {
                return res.status(400).json({message: 'Пароль или email - некорректны'})
            }

            const candidate = await UserService.findUserFromDB(email)
            if (candidate) {
                return res.status(400).json({message: 'Такой пользователь уже существует'})
            }

            const hashPassword = await UserService.hashPassword(password, 3);
            const activationLink =  uuid.v4();

            const user = await UserService.createUserAndSaveToDB(email, hashPassword, role, activationLink)
            await mailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink}`);

            const userDto = new UserDto(user)
            const tokens = TokenService.generateToken({...userDto})
            await TokenService.saveToken(userDto.id, tokens.refreshToken)

            const result = {
                ...tokens,
                user: userDto
            }
            return res.json(result)
        } catch (e) {
            console.log(e)
        }
    }

    async login(req, res) {
        try {
            const {email, password, isActivated} = req.body
            console.log(email, password)
            const user = await UserService.findUserFromDB(email)
            if (!user) {
                return res.status(400).json({message: `Пользователь ${email} не найден`})
            }

            const validPassword = await UserService.comparePassword(password, user.password)
            if (!validPassword) {
                return res.status(400).json({message: `Введен неверный пароль`})
            }

            if (!user.isActivated)
            {
                return res.status(400).json({message: `Пользователь ${email} не активирован`});
            }

            const userDto = new UserDto(user)
            const tokens = TokenService.generateToken({...userDto})
            await TokenService.saveToken(userDto.id, tokens.refreshToken)

            const result = {
                ...tokens,
                user: userDto
            }
            return res.json(result)
        } catch (e) {
            console.log(e)
        }
    }

    async getAllUsers(req, res) {
        try {
            const users = await UserService.getAllUserFromDB()
            res.json(users)
        } catch (e) {
            console.log(e)
        }
    }

    async refreshToken(req , res) {
        const token = req.headers.authorization.split(' ')[1]
        if (!token) {
            return res.status(400).json({message: `Токен отстутсвует`})
        }

        console.log("token = " + token)

        const userData = await TokenService.validateRefreshToken(token)
        const tokenFromDB = await TokenService.findToken(token)
        console.log(userData)
        console.log(userData.id + "      -id")
        console.log("1 - " + userData.id,"2 - " +  tokenFromDB)

        if (!userData || !tokenFromDB) {
            return res.status(400).json({message: `Неавторизованный пользователь`})
        }

        const user = await UserService.findUserByIdFromDB(userData.id)
        const userDto = new UserDto(user)
        const tokens = TokenService.generateToken({...userDto})
        await TokenService.saveToken(userDto.id, tokens.refreshToken)

        const result = {
            ...tokens,
            user: userDto
        }
        return res.json(result)
    }

    async deleteToken(req, res) {
        const {id} = req.body

        const result = await Token.deleteOne({user: id})
       return res.json({id, result})
    }

    async eventCreate(req, res) {
        const {title, dateStart, dateEnd, name, creator} = req.body
        const event = new Event({
            title: title,
            dateStart: dateStart,
            dateEnd: dateEnd,
            name: name,
            creator: creator
        })
        
        user.find({isActivated: "true"}).exec(function(err, users) {
            if (err)
            {
                throw err;
            }
            async function processArray()
            {
               for (const user of users)
                {
                    await mailService.sendEventMail(user.email, `${process.env.API_URL}/event/events`);
                }
            }
            processArray();
        });
        res.json(event)
    }

    async eventDelete(req, res) {
        try {
            const id = req.params.id
            const event = await Event.findById(id)
            if (!event) {
                res.json("Такой event отсутсвует или был удален")
            } else {
                await Event.deleteOne({_id: id})
                res.json('delete event')
            }
        } catch (e) {
            res.json(e)
        }
    }

    async getAllEvents(req, res) {
        const events = await Event.find()
        res.json(events)
    }
    async activate (req, res, next)
    {
        try {
            const activationLink = req.params.link;
            await userService.activate(activationLink);
            return res.redirect(process.env.CLIENT_URL);
        }
        catch {
            console.log(e);
        }
    }
}

module.exports = new userController()