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
    creator: {
        type: String,
        required: true
    },
    results: [
        {

        }
    ],
})

module.exports = model('Event', Event)