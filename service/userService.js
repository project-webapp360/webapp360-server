const bcrypt = require('bcryptjs')
const User = require('../models/user')
const UserDto = require('../dto/user-dto')
const user = require('../models/user')

class UserService {

 async findUserFromDB(email) {
     return User.findOne({email})
 }

 async findUserByIdFromDB(id) {
     return User.findById(id)
 }

 async createUserAndSaveToDB(email, hashPassword, role, activationLink, nickName, firstName, lastName) {
     const user = new User({
         email,
         password: hashPassword,
         role,
         activationLink: activationLink,
         nickName,
         firstName,
         lastName
     })
     return user.save()
 }

 async getAllUserFromDB() {
     return User.find()
 }

 async deleteUserByEmail(email) {
     await User.deleteOne({email})
 }

 async bannedUser(user) {
     user.isBanned = true
     return user.save()
 }

 async unbannedUser(user) {
     user.isBanned = false
     return user.save()
 }

 async hashPassword(password, salt) {
     return bcrypt.hash(password, salt)
 }

 async comparePassword(reqPassword, userPassword) {
     return bcrypt.compare(reqPassword, userPassword)
 }
 async activate(activationLink) {
    const USER = await user.findOne({"activationLink": activationLink});
    if (!USER)
    {
        throw new Error("Неккоректная ссылка активации");
    }
    USER.isActivated = true;
    await USER.save();
}
}

module.exports = new UserService()