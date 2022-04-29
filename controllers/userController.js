const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Token = require('../models/token')
const Event = require('../models/event')
const UserEvent = require('../models/userEvent')
const User = require('../models/user')
const Test1 = require('../models/test1')
const Test2 = require('../models/test2')
const UserService = require('../service/userService')
const UserDto = require('../dto/user-dto')
const TokenService = require('../service/tokenService')
const uuid = require('uuid');
const mailService = require("../service/mailService");
const userService = require('../service/userService')
const user = require('../models/user')
const {json} = require("express");


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
            const userdb = await userService.findUserFromDB(email)


            const allEvents = await Event.find({})

            const arrayEvents = []


            let size = 0
            for (let item of allEvents) {
                size++
            }
            console.log(size)


            for (let i = 0; i < size; i++) {
                arrayEvents.push({
                    type: allEvents[i]._id,
                    needComplete: true
                })
                console.log('add another item')
            }

            const userEvents = new UserEvent({
                user: userdb._id,
                events: arrayEvents
            })
            await userEvents.save()

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

            /*const result = {
                ...tokens,
                user: userDto
            }*/

            const result = userDto
            return res.json(result)
        } catch (e) {
            console.log(e)
        }
    }

    async deleteUser(req, res) {
        try {
            const {email} = req.body
            const user = await userService.findUserFromDB(email)
            if (!user) {
                return res.status(400).json({message: "Такого пользователя не существует или он уже был удален"})
            }
            await userService.deleteUserByEmail(user.email)
            res.json(`${email} was deleted`)
        } catch (e) {
            res.json(e)
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
        if (!title || !dateStart || !dateEnd || !name || !creator) {
            console.log(`title: ${title} + dateStart: ${dateStart} + dateEnd: ${dateEnd} + name: ${name} + creator: ${creator}`)
            return res.status(400).json({message: `Отсутствуют аргумент(ы) event`})
        }

        const event = new Event({
            title: title,
            dateStart: dateStart,
            dateEnd: dateEnd,
            name: name,
            creator: creator
        })

        event.save()

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

    async eventCreateUser(req, res) {
        const {id} = req.body

        const users = await userService.getAllUserFromDB()
        if (!users) {
            return res.status(400).json({message: `Пользователи не найдены`})
        }

        for (let user of users) {
            console.log(user)
            const userEvents = await UserEvent.findOne({user: user._id})
            console.log({userEvents: userEvents})
            if(userEvents != null) {
                userEvents.events.push({
                    type: id,
                    needComplete: true
                })
                userEvents.save()
            }
        }

        res.json(users)

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

    async eventDeleteUser(req, res) {
        try {
            const {idUser, idEvent} = req.body

            console.log(`${idUser} + ${idEvent}`)

            const users = await userService.getAllUserFromDB()
            console.log(users)
            let arrayEvents = []
            for (let user of users) {

                const userEvent = await UserEvent.findOne({user: user._id})
                    if (userEvent !== null) {
                        if (!userEvent) {
                            return res.status(400).json({message: `События пользователя не найдены`})
                        }

                        console.log('hello')
                        console.log(userEvent)

                        userEvent.events.map((item) => {
                            console.log('=')
                            if (item.type.toString() === idEvent.toString()) {
                                console.log('+')
                            } else {
                                console.log(`${item.type} + ${idEvent}`)
                                console.log('-')
                                arrayEvents.push(item)
                            }
                        })
                        userEvent.events = arrayEvents
                        await userEvent.save()
                        arrayEvents = []
                    } else {
                        arrayEvents = []
                    }
            }
            console.log(arrayEvents)
            console.log('bye')
            res.json('delete event')

        } catch (e) {
            res.json(e)
        }
    }

    async getAllEvents(req, res) {
        const events = await Event.find()
        res.json(events)
    }

    async getAllEventsUser(req, res) {
        const {id} = req.body
        // console.log(`id:   ${id}`)
        const userEvents = await UserEvent.findOne({user: id})
        // console.log(`userEvents:   ${userEvents}` )
        let arrayEvents = []
        for (let event of userEvents.events) {
            const eventdb = await Event.findOne({_id: event.type})
            if (!eventdb) {
                return res.status(400).json({message: `Такого события нету в общих событиях в бд`})
            }
            const eventModel = {
                _id: eventdb._id,
                title: eventdb.title,
                dateStart: eventdb.dateStart,
                dateEnd: eventdb.dateEnd,
                name: eventdb.name,
                creator: eventdb.creator,
                needComplete: event.needComplete
            }
            arrayEvents.push(eventModel)
        }
        // res.json(userEvents.events)
        // console.log(`arrayEvents: ${arrayEvents}`)
        // console.log(arrayEvents)
        res.json(arrayEvents)
    }

    async getUserEvents(req, res) {
        const {id} = req.body
        const allEvents = await Event.find()
        const userEvents = await UserEvent.findOne({user: id})
    }

    async resultsSetUser(req, res) {
        const {id, results} = req.body
        console.log(id)
        console.log(results)

        const event = await Event.findOne({_id: id})
        if (!event) {
            return res.status(400).json({message: `Такого события нету в бд`})
        }
        event.results.push(results)
        event.save()
    }

    async resultsGetUser(req, res) {
        try {
            const {eventId} = req.body
            const event = await Event.findOne({_id: eventId})
            if (!event) {
                return res.status(400).json({message: `Такого события нету в бд`})
            }
            res.json(event)
        } catch (e) {
            res.json(e)
        }
    }


    async testingCreateRoute(req, res) {
        try {
            const test2 = new Test2({
                stroke: "Hello"
            })
            await test2.save()

            const test2db = await Test2.findOne({stroke: 'Hello'})
            const test1 = new Test1({
                testref: test2db._id
            })
            await test1.save()
            res.json("done")
        } catch (e) {
            res.json(e)
        }

    }

    async testingDeleteRoute(req, res) {
        try {
            const test2 = await Test2.findOne({stroke: 'Hello'})
            await Test2.deleteOne({_id: test2._id})
            await Test1.deleteOne({testref: test2._id})
            res.json('done')
        } catch (e) {
            res.json(e)

        }
    }


    async activate (req, res)
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