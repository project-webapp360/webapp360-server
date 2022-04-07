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
    }
})

module.exports = model('User', User)