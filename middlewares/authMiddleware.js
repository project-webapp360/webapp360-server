const jwt = require('jsonwebtoken')
const TokenService = require('../service/tokenService')

module.exports = function (req, res, next) {
    if (req.method === 'OPTIONS') {
        next()
    }

    try {
        const token = req.headers.authorization.split(' ')[1]

        if (!token) {
            return res.status(403).json({message: 'Пользователь не авторизован 1 case'})
        }


        const userData = TokenService.validateAccessToken(token)
        if (!userData) {
            return res.status(403).json({message: 'Пользователь не авторизован 2 case'})
        }

        const decodedData = jwt.verify(token, process.env.JWT_SECRET_KEY_ACCESS)
        req.user = decodedData
        next()
    } catch (e) {
        return res.status(403).json({message: 'Пользователь не авторизован 3 case'})
    }
}