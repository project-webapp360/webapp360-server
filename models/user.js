const {Schema, model} = require('mongoose')

const User = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        default: "USER"
    },
    isActivated:{
        type: Boolean,
        default: false
    }, 
    activationLink:{
        type: String
    },
    isBanned: {
        type: Boolean,
        default: false
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    nickName: {
        type: String,
        required: true
    },
    results: [
        {

        }
    ]

})

module.exports = model('User', User)