const bcrypt = require('bcryptjs')
const User = require('../models/user')
const UserDto = require('../dto/user-dto')

class UserService {

 async findUserFromDB(email) {
     return User.findOne({email})
 }

 async findUserByIdFromDB(id) {
     return User.findById(id)
 }

 async createUserAndSaveToDB(email, hashPassword, role) {
     const user = new User({
         email,
         password: hashPassword,
         role
     })
     return user.save()
 }

 async getAllUserFromDB() {
     return User.find()
 }

 async hashPassword(password, salt) {
     return bcrypt.hash(password, salt)
 }

 async comparePassword(reqPassword, userPassword) {
     return bcrypt.compare(reqPassword, userPassword)
 }

}

module.exports = new UserService()