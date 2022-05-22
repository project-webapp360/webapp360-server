const {Schema, model} = require('mongoose')

const UserEvent = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    events: [{
        type: {
            type: Schema.Types.ObjectId,
            ref: 'Event'
        },
        needComplete: {
            type: Boolean,
            default: true
        }
    }]
})

module.exports = model('UserEvent', UserEvent)