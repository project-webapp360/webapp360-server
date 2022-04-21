const {Schema, model} = require('mongoose')

const Test2 = new Schema({
    stroke: {
        type: String,
        required: true
    }
})

module.exports = model('Test2', Test2)