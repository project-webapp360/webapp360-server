const {Schema, model} = require('mongoose')

const Event = new Schema({
    title: {
        type: String,
        required: true
    },
    dateStart: {
        type: String,
        required: true
    },
    dateEnd: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    emailName: {
        type: String,
        required: true,
        default: "hello@mail.ru"
    },
    creator: {
        type: String,
        required: true
    },
    type: {
        type: Number,
        required: true
    },
    results: [
        {

        }
    ],
    needToComplete: {
        type: Number,
        required: true
    },
    alreadyComplete: {
        type: Number,
        required: true
    },
})

module.exports = model('Event', Event)