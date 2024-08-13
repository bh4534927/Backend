const {Schema,model} = require('mongoose')
const userSchema =  new Schema({
    Name: {
        type:String,
        required: true,
        max_length:100,
    },
    email:{
        type:String,
        required: true,
        max_length:100,
    },
    password:{
        type:String,
        required:true,
        max_length:100,
    },
    role:{
        type:String,
        enum:['Administrator','Observer','owner','user','writer'],
        default:'user'
    },
    accountStatus:{
        type:String,
        enum:['Active','Suspended','Deleted'],
        default:'Active'
    },
    Institution:{
        type:String,
        required:[true,'The institution is required'],
        default:"None"
    },
    UserType:{
        type:String,
        enu:['Presiding Officer','Administrator','Returning Officer','Observer'],
        required:[true,'The User type is required'],
        default:'Returning Officer'
    },
},{timestamps:true})
const User = model('User',userSchema)
module.exports = User