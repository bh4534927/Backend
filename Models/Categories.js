const {Schema,model} = require('mongoose')

const VoterSchema = new Schema({
    Institution:{
        type:String,required:[true,'The institution is required']
    },
    CategoryName:{
        type:String,
        required:[true,'The category name is required']
    },
    CategoryStatus:{
        type:String,
        enum:['Allowed', 'Denied','Restricted'],
        default:'Allowed'
    }
},{timestamps:true})

const Category = model('Category',VoterSchema)
module.exports = Category