const {Schema,model} = require('mongoose')
//create the polls schema 
const pollSchema = new Schema({
    pollName:{
        type:String,
        required:[true,'Poll Name is required']
    },
    Institution:{
        type:String,
        required:[true,'Institution Name is required'],
    },
    PollStatus:{
        type:String,
        enum:['Active','Started','End','Suspended','Pending...'],
        default:'Pending...'
    },
    CreatedBy:{
        type:String,
        default:"Administrator"
    },
    PollYear:{
        type:String,
        default:new Date().getFullYear()
    },
    UpdatedBy:{
        type:String,
        default:"Administrator"
    }
},{timestamps:true})
//export the schema 

const Polls = model('Polls',pollSchema)
module.exports = Polls