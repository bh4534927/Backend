const {Schema,model} = require('mongoose')

//create the voter's categories per institution

const VoterCategorySchema = new Schema({
    Institution:{
        type:String,
        required:[true,'The Institution is required']
    },
    Category:{
        type:String,
        required:[true,'The category is required']
    },
    CategoryStatus:{
        type:String,
        enum:['Active','Suspended','Pending']
    }
},{timestamps:true})

const VoterCategories = model('VoterCategories',VoterCategorySchema)

module.exports = VoterCategories