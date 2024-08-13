const { Schema, model } = require('mongoose')
const VoterSchema = new Schema({
    Name: {
        type: String,
        required: true,
        max_length: 100,
    },
    IdNumber: {
        type: String,
        required: [true, 'The Unique Identifier is required'],
        default: null
    },
    Institution: {
        type: String,
        required: [true, 'The institution is required'],
        default: null
    },
    //Either Form 1, Form 2 , form 3 or form 4
    voterCategory: {
        type: String,
        required: [true, 'User Category is required']
    },
    VoterStatus: {
        type: String,
        enum: ['Active', 'Absent', 'Restricted','Deleted'],
        default: 'Active'
    },
}, { timestamps: true })
const Voters = model('Voters', VoterSchema)
module.exports = Voters