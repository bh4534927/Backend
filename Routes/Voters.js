const {Router} = require('express')
const { PostUsers,InstitututionsUsers ,PollInstitution,FilterVoters,ViewAllVoters,DeleteVoters,UploadVoters,InstitutionActivePolls,DeleteSelectedVoter,SuspendSelectedVoter,ActivateSelectedVoter,SuspendVoterCategory,SuspendVoters,ActivateVoters} = require('../Controllers/VotersController')

const VotersRouter = Router()
const multer = require('multer')
require('dotenv').config()
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, process.env.UPLOAD_DIR)
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})
function checkFileType(file, cb) {
    const filetypes = /csv/;
    const extname = filetypes.test(file.originalname.toLowerCase());
    const mimetype = file.mimetype === 'text/csv' || file.mimetype === 'text/comma-separated-values';
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Invalid file type'));
    }
}
const uploadFile = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        checkFileType(file, cb);
    }
})
VotersRouter.post('/Voters-Users',PostUsers)
.post("/Polls-Institutions",PollInstitution)
.post("/Active-Polls-Institutions",InstitutionActivePolls)
.post("/Institututions-Userss",InstitututionsUsers)
.get("/All-Voters",ViewAllVoters)
.post("/Upload-Voters",uploadFile.single('votersFile'),UploadVoters)
.post("/Suspend-Selected-Voter",SuspendSelectedVoter)
.post("/Delete-Selected-Voter",DeleteSelectedVoter)
.post("/Activate-Selected-Voter",ActivateSelectedVoter)
.post('/Suspend-A-Category',SuspendVoterCategory)
.post('/SuspendVoters',SuspendVoters)
.post('/Activate-Voters',ActivateVoters)
.post('/Filter-voters',FilterVoters)
.post('/Delete-Institution-Voters',DeleteVoters)
module.exports = VotersRouter