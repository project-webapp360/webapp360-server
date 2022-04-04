const jwt = require('jsonwebtoken')
const Token = require('../models/token')

class TokenService {

    validateAccessToken(token) {
        try {
            const userData = jwt.verify(token, process.env.JWT_SECRET_KEY_ACCESS)
            return userData
        } catch (e) {
            return null
        }
    }

    validateRefreshToken(token) {
        try {
            const userData = jwt.verify(token, process.env.JWT_SECRET_KEY_REFRESH)
            return userData
        } catch (e) {
            return null
        }
    }

    generateToken(payload) {
        const accessToken = jwt.sign(payload, process.env.JWT_SECRET_KEY_ACCESS, {expiresIn: '10s'})
        const refreshToken = jwt.sign(payload, process.env.JWT_SECRET_KEY_REFRESH, {expiresIn: '30d'})
        return {
            accessToken, refreshToken
        }
    }

    async saveToken(userId, refreshToken) {
        const tokenData = await Token.findOne({user: userId})
        if (tokenData) {
            tokenData.refreshToken = refreshToken
            return tokenData.save()
        }
        // const token = new tokenModel.create({user: userId, refreshToken})
        const token = new Token({
            user: userId,
            refreshToken
        })
         return token.save()
    }

    async removeToken(refreshToken) {
        const tokenData = await Token.deleteOne({refreshToken})
        return tokenData
    }

    async findToken(refreshToken) {
        const tokenData = await Token.findOne({refreshToken})
        return tokenData
    }

}

module.exports = new TokenService()