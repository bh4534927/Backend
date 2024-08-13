const {model,Schema} = require('mongoose')

const InstitutionSchema = new Schema({
    InstitutionName :{
        type:String,
        required:[true,'The Institution name is required']
    },
    County:{
        type:String,
        required:[true,'The county name is required']
    },
    SubCounty :{
        type:String,
        required:[true,'The county name is required']
    },
    Status:{
        type:String,
        enum:['Active','Pending','Suspended'],
        default:'Pending'
    }
},{timestamps:true})
//export the schema 
const Institutions = model('Institution',InstitutionSchema)

module.exports =  Institutions