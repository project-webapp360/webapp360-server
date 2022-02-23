const jwt = require('jsonwebtoken')
const TokenService = require("../service/tokenService");

module.exports = function (role) {
   return function (req, res, next) {
        if (req.method === 'OPTIONS') {
            next()
        }

        try {
            const token = req.headers.authorization.split(' ')[1]

            if (!token) {
                return res.status(403).json({message: 'Пользователь не авторизован 1 case role, с клиента не был предоставлен токен (вы пытаетесь получить доступ к функциям не авторизовавшись)'})
            }


            const userData = TokenService.validateAccessToken(token)
            if (!userData) {
                return res.status(401).json({message: 'Пользователь не авторизован 2 case role, валидация не прошла (токен истек)'})
            }

            const decodedData = jwt.verify(token, process.env.JWT_SECRET_KEY_ACCESS)
            if (decodedData.role !== role) {
                return res.status(403).json({message: `Отказано в доступе ${decodedData.role}, вы должны обладать правами: ${role}`})
            }

            req.user = decodedData
            next()
        } catch (e) {
            return res.status(403).json({message: 'Пользователь не авторизован 3 case role'})
        }
    }
}