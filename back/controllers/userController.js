const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Token = require('../models/token')
const UserService = require('../service/userService')
const UserDto = require('../dto/user-dto')
const TokenService = require('../service/tokenService')


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

            const hashPassword = await UserService.hashPassword(password, 3)
            const user = await UserService.createUserAndSaveToDB(email, hashPassword, role)

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
            const {email, password} = req.body
            console.log(email, password)
            const user = await UserService.findUserFromDB(email)
            if (!user) {
                return res.status(400).json({message: `Пользователь ${email} не найден`})
            }

            const validPassword = await UserService.comparePassword(password, user.password)
            if (!validPassword) {
                return res.status(400).json({message: `Введен неверный пароль`})
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
}

module.exports = new userController()