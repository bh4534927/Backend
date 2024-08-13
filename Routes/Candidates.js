const {Router} = require('express')
const { AddCandidate,ViewInstitutionCandidates,ViewAllCandidates,SuspendnstitutionCandidates,ActivateInstitutionCandidates } = require('../Controllers/Candidates')
const { ViewAllVoters } = require('../Controllers/VotersController')
const CandidatesRouter = Router()

CandidatesRouter.post('/AddCandidate',AddCandidate)
.post('/ViewCandidates',ViewInstitutionCandidates)
.get('/ViewAllCandidates',ViewAllCandidates)
.post('/Suspend-Candidate',SuspendnstitutionCandidates)
.post('/Activate-Candidate',ActivateInstitutionCandidates)
module.exports = CandidatesRouter