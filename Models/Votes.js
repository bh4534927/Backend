const {Schema,model} = require('mongoose')
//create the votes schema 
const VoteSchema = new Schema({
    Voter:{
        type:String,
        required:[true,'The Voters name is required']
    },
    Candidate:{
        type:String,
        required:[true,'The Voters name is required']
    },
    CandidateName:{
        type:String,
        required:[true,'The candidate name is required'],
    },
    VoteStatus:{
        type:String,
        enum:['Accepted','Rejected'],
        default:'Accepted'
    },
    VoteYear:{
        type:String,
        required:[true,'The Vote year is required'],
        default:'2024'
    },
    PollName:{
        type:String,
        required:[true,'The Poll name is required'],
    },
    Institution:{
        type:String,
        required:true,
    },
    Role:{
        type:String,
        required:true,
    },
    Official:{
        type:String,
        required:[true,'The Official Name is required'],
        default:'Administrator'
    }
},{timestamp:true})

const Votes = model('Votes',VoteSchema)
module.exports = Votes