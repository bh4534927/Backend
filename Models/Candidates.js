//this is where we save the candidates 
const {Schema,model} = require('mongoose')

const CandidateSchema = new Schema({
    CandidateName:{
        type:String,
        required:[true,'The  Candidate name is required']
    },
    CandidateID:{
        type:String,
        required:[true,'The  Candidate ID is required']
    },
    CandidatePhoto:{
        type:String,
        required:[true,'The Candidate photo is required'],
        default:'none'
    },
    CandidateInstitution:{
        type:String,
        required:[true,'The Candidate Institution is required'],
    },
    CandidateVotes:{
        type:Number,
        default:0,
    },
    CandidateStatus:{
        type:String,
        enum:['Active','Disqualified'],
        default:'Active'
    },
    Poll:{
        type:String,
        required:[true,'The Poll is required'],
    },
    VotedBy:{
        type:String,
        required:[true,'The Voters are required']
    },
    Post:{
        type:String,
        required:[true,'The Post Vied for is required']
    }
},{timestamps:true})

const PostsSchema = new Schema({
    Post:{
        type:String,
        required:[true,'The Post is required'],
    },
    Institution:{
        type:String,
        required:[true,'The Institution is required'],
    },
    PostStatus:{
        type:String,
        enum:['Active','Suspended'],
        edfault:'Active'
    }
},{timestamps:true})

const Candidates = model('Candidates',CandidateSchema)
const Posts = model('Posts',PostsSchema)
module.exports = {Candidates,Posts}