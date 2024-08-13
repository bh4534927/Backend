const Voters = require('../Models/Voters')
const { Candidates } = require('../Models/Candidates')
const Polls = require('../Models/Polls')
const AddCandidate = async (req, res) => {
    const { CandidatesVoted, Institution, Poll, VotingGroup, Post } = req.body
    CandidatesVoted.map(async (candidate) => {
        try {
            const voterCount = await Voters.countDocuments({ IdNumber: candidate, Institution: Institution })
            if (voterCount > 0) {
                const voter = await Voters.findOne({ IdNumber: candidate, Institution: Institution })
                const ifCandidate = await Candidates.countDocuments({
                    CandidateName: voter.Name,
                    CandidateID: voter.IdNumber,
                    CandidateInstitution: Institution,
                    Poll: Poll,
                })
                if (ifCandidate > 0) {
                    let message = `${voter.Name} Is Already Running For Another Post`
                    res.json({
                        status: 'error',
                        message: message
                    })
                } else {
                    const newcandidate = new Candidates({
                        CandidateName: voter.Name,
                        CandidateID: voter.IdNumber,
                        CandidateInstitution: Institution,
                        Poll: Poll,
                        VotedBy: VotingGroup,
                        Post: Post
                    })
                    await newcandidate.save()
                    res.json({
                        status: 'success',
                        message: 'Candidates Successfully Added!'
                    })
                }

            } else {
                res.json({
                    status: 'error',
                    message: 'Candidate Must be registered as a Voter'
                })
            }
        } catch (error) {

        }
    })
    //add the roles 
}
const ViewInstitutionCandidates = async (req, res) => {
    //get the post data 
    const { Institution, poll } = req.body
    if (!Institution || !poll) {
        res.json({
            status: 'error',
            message: 'Invalid data Submitted'
        })
    }
    else {

        //get the candidates from depending on the active poll 
        const candidates = await Candidates.find({ CandidateInstitution: Institution, Poll: poll })
        res.json({
            status: 'success',
            message: 'Candidates Successfully Fetched',
            candidates: candidates
        })
    }
}
const SuspendnstitutionCandidates = async (req, res) => {
    const { Institution, poll, UniqueID } = req.body
    if (!Institution || !poll || !UniqueID) {
        res.json({
            status: 'error',
            message: 'Invalid data Submitted'
        })
    }
    else {
        //get the candidates from depending on the active poll 
        const candidate = await Candidates.countDocuments({ CandidateInstitution: Institution, Poll: poll, CandidateID: UniqueID })
        if (candidate) {
            const newCandidate = await Candidates.findOne({ CandidateInstitution: Institution, Poll: poll, CandidateID: UniqueID })
            //update the record 
            const updatedCandidate = await Candidates.updateOne({
                CandidateInstitution: Institution, Poll: poll, CandidateID: UniqueID
            }, {
                $set: {
                    CandidateStatus: "Disqualified"
                }
            })
            res.json({
                status:'success',
                message:`${(newCandidate.CandidateName).toLocaleLowerCase()} Disqualified`
            })
        } else {

            res.json({
                status: 'error',
                message: 'Candidates Not Found',
            })
        }
    }
}
const ActivateInstitutionCandidates = async (req, res) => {
    const { Institution, poll, UniqueID } = req.body
    if (!Institution || !poll || !UniqueID) {
        res.json({
            status: 'error',
            message: 'Invalid data Submitted'
        })
    }
    else {
        //get the candidates from depending on the active poll 
        const candidate = await Candidates.countDocuments({ CandidateInstitution: Institution, Poll: poll, CandidateID: UniqueID })
        if (candidate) {
            const newCandidate = await Candidates.findOne({ CandidateInstitution: Institution, Poll: poll, CandidateID: UniqueID })
            //update the record 
            const updatedCandidate = await Candidates.updateOne({
                CandidateInstitution: Institution, Poll: poll, CandidateID: UniqueID
            }, {
                $set: {
                    CandidateStatus: "Active"
                }
            })
            res.json({
                status:'success',
                message:`${(newCandidate.CandidateName).toLocaleLowerCase()} Activated`
            })
        } else {

            res.json({
                status: 'error',
                message: 'Candidates Not Found',
            })
        }
    }
}
const ViewAllCandidates = async (req, res) => {
    const candidates = await Candidates.find()
    res.json({
        status: 'success',
        message: 'Candidates Successfully Fetched',
        candidates: candidates
    })
}
module.exports = { AddCandidate, ViewInstitutionCandidates, ViewAllCandidates, SuspendnstitutionCandidates ,ActivateInstitutionCandidates}