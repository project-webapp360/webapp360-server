const {Schema, model} = require('mongoose')

const Test1 = new Schema({
    testref: {
        type: Schema.Types.ObjectId,
        ref: 'Test2'
    }
})

module.exports = model('Test1', Test1)