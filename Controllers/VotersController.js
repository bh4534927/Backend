const User = require("../Models/User")
const Voters = require("../Models/Voters")
const Polls = require("../Models/Polls")
const bcrypt = require('bcryptjs')
const ProjectRoot = require("../getProjectRoot")
const { Candidates } = require('../Models/Candidates')
const Votes = require('../Models/Votes')
const path = require('path')
const parse = require('csv-parse')
require('dotenv').config()
//import the file system 
const fs = require('fs');
const PostUsers = async (req, res) => {
    const { fullName, uniqueId, email, institution, userType, userCat } = req.body
    if (userType === 'Voter') {
        //check if the user exists 
        const voterExists = await Voters.countDocuments({ IdNumber: uniqueId })
        if (voterExists > 0) {
            //the userr exists 
            res.json({
                status: 'error',
                message: 'The Voter already exists',
            })
        } else {
            //save the details to the voter's moodel
            const voter = new Voters({
                Name: fullName,
                IdNumber: uniqueId,
                Institution: institution,
                UserType: userType,
                voterCategory: userCat
            })
            await voter.save()
            res.json({
                status: 'success',
                message: 'Voter successfully Added',
            })
        }
    } else {
        //save this to the user's table
        const userExists = await User.countDocuments({ email: email })
        if (userExists > 0) {
            res.json({
                status: 'error',
                message: 'The User already exists',
            })
        } else {
            const new_user = new User({
                Name: fullName,
                email: email,
                password: uniqueId,
                role: 'user',
                Institution: institution,
                UserType: userType
            })
            const salt = await bcrypt.genSalt(10)
            const new_password = await bcrypt.hash(uniqueId, salt)
            new_user.password = new_password
            await new_user.save()
            res.json({
                status: 'success',
                message: 'User successfully Added',
            })
        }
        //unique id is the password for the user

    }
}
const PollInstitution = async (req, res) => {
    const { institution } = req.body
    if (!institution) {
        res.json({ status: 'error', message: 'Institution is required' })
    } else {
        //get all polls from the institution
        const polls = await Polls.find({ Institution: institution }, {
            __v: 0,
            _id: 0
        })
        res.json({
            status: 'success',
            polls: polls
        })
    }
}
const InstitutionActivePolls = async (req, res) => {
    const { institution } = req.body
    if (!institution) {
        res.json({ status: 'error', message: 'Institution is required' })
    } else {
        //get all polls from the institution
        const polls = await Polls.find({ Institution: institution, PollStatus: 'Pending...' }, {
            __v: 0,
            _id: 0
        })
        res.json({
            status: 'success',
            polls: polls
        })
    }
}
const InstitututionsUsers = async (req, res) => {
    const { institution, userType } = req.body
    if (!institution || !userType) {
        res.json({ status: 'error', message: 'Invalid data submitted' })
    } else {
        //get all voters from the institution
        //if type is voters 
        if (userType === 'Voters') {
            const voters = await Voters.find({ Institution: institution, VoterStatus: { $ne: 'Deleted' } }, {
                __v: 0,
                _id: 0
            })
            res.json({
                status: 'success',
                message: 'Voters successfully retrieved',
                data: voters
            })
        } else {
            //get the users from the user's table 
            const users = await User.find({ Institution: institution }, {
                __v: 0,
                _id: 0
            })
            res.json({
                status: 'success',
                message: 'users successfully retrieved',
                data: users
            })
        }
    }
}
const ViewAllVoters = async (req, res) => {
    const voters = await Voters.find({ VoterStatus: { $ne: 'Deleted' } }).select('Name IdNumber Institution voterCategory VoterStatus')
    res.json({
        status: 'success',
        message: 'All Voters successfully retrieved',
        data: voters
    })


}
const UploadVoters = async (req, res) => {
    if (!req.file) {
        //then there is no file sent, return error
    } else {
        //get the institution  from the request body 
        const { Institution } = req.body
        const filename = req.file.filename
        const filePath = path.join(ProjectRoot, process.env.UPLOAD_DIR, filename)
        ReadCSVFile(filePath, Institution)
        //pass the file to the reader
        res.json({
            status: 'success',
            data: req.body
        })
    }
}
const ReadCSVFile = async (file, institution) => {
    let resp = null
    //create the read stream for the file 
    let count = 0
    fs.createReadStream(file)
        .pipe(parse.parse({
            comment: '#',
            columns: true
        }))
        .on('data', (data) => {
            //save the data to the database
            resp = RegisterUser(data, institution)
            //save to the database
            count = count + 1
        })
        .on('error', error => {
            console.log(error)
        })
        .on('end', () => {
        })
    return resp
}
const RegisterUser = async (userData, institution) => {
    const { FullNames, UniqueIdentifier, UserType, EmailAddress, Category } = userData
    if (UserType === 'Voter') {
        //check if the user exists 
        const voterExists = await Voters.countDocuments({ IdNumber: UniqueIdentifier })
        if (voterExists > 0) {
            return false
        } else {
            //save the details to the voter's moodel
            try {
                const voter = new Voters({
                    Name: FullNames,
                    IdNumber: UniqueIdentifier,
                    Institution: institution,
                    UserType: UserType,
                    voterCategory: Category
                })
                await voter.save()
                return true
            } catch (error) {
                return false
            }

        }
    } else {
        //save this to the user's table
        const userExists = await User.countDocuments({ email: EmailAddress })
        if (userExists > 0) {
            return true
        } else {
            const new_user = new User({
                Name: FullNames,
                email: EmailAddress,
                password: UniqueIdentifier,
                role: 'user',
                Institution: institution,
                UserType: UserType
            })
            const salt = await bcrypt.genSalt(10)
            const new_password = await bcrypt.hash(UniqueIdentifier, salt)
            new_user.password = new_password
            await new_user.save()

            return false
        }
    }
}
const DeleteSelectedVoter = async (req, res) => {
    //get the voter's unique id 
    const { institution, uniqueID } = req.body
    if (!uniqueID || !institution) {
        res.json({
            status: 'error',
            message: 'Invalid data submitted'
        })
        //get the voter from the database 
    } else {
        try {
            //check if the user exists 
            const voterCount = await Voters.countDocuments({
                IdNumber: uniqueID,
                Institution: institution
            })
            if (voterCount > 0) {
                const voter = await Voters.findOneAndUpdate({
                    IdNumber: uniqueID,
                    Institution: institution
                }, {
                    $set: {
                        VoterStatus: 'Deleted'
                    },
                })
                res.json({
                    status: 'success',
                    message: `${voter.Name} Successfully Deleted`
                })
            } else {
                res.json({
                    status: 'error',
                    message: 'No User Found!'
                })
            }
        } catch (error) {
            res.json({
                status: 'error',
                message: `Unknown error occurred!.`
            })
        }
    }
}
const SuspendSelectedVoter = async (req, res) => {
    //get the voter's unique id 
    const { institution, uniqueID } = req.body
    if (!uniqueID || !institution) {
        res.json({
            status: 'error',
            message: 'Invalid data submitted'
        })
        //get the voter from the database 


    } else {
        try {
            //check if the user exists 
            const voterCount = await Voters.countDocuments({
                IdNumber: uniqueID,
                Institution: institution
            })
            if (voterCount > 0) {
                const voter = await Voters.updateOne({
                    IdNumber: uniqueID,
                    Institution: institution
                }, {
                    $set: {
                        VoterStatus: 'Restricted'
                    },
                })
                res.json({
                    status: 'success',
                    message: `Voter Successfully Suspended`
                })
            } else {
                res.json({
                    status: 'error',
                    message: 'No User Found!'
                })
            }
        } catch (error) {
            res.json({
                status: 'error',
                message: `Unknown error occurred!.`
            })
        }
    }
}
const ActivateSelectedVoter = async (req, res) => {
    //get the voter's unique id 
    const { institution, uniqueID } = req.body
    if (!uniqueID || !institution) {
        res.json({
            status: 'error',
            message: 'Invalid data submitted'
        })
        //get the voter from the database 


    } else {
        try {
            //check if the user exists 
            const voterCount = await Voters.countDocuments({
                IdNumber: uniqueID,
                Institution: institution
            })
            if (voterCount > 0) {
                const voter = await Voters.updateOne({
                    IdNumber: uniqueID,
                    Institution: institution
                }, {
                    $set: {
                        VoterStatus: 'Active'
                    },
                })
                res.json({
                    status: 'success',
                    message: `Voter Successfully Activated`
                })
            } else {
                res.json({
                    status: 'error',
                    message: 'No User Found!'
                })
            }
        } catch (error) {
            res.json({
                status: 'error',
                message: `Unknown error occurred!.`
            })
        }
    }
}
const SuspendVoterCategory = async () => {

}
const SuspendVoters = async (req, res) => {
    //get the posted voter category and the institution 
    const { Institution, VoterCategory } = req.body
    if (!Institution || !VoterCategory) {
        res.json({
            status: 'error',
            message: 'Invalid Details Submitted'
        })
    } else {
        //check if the voters exists 
        const voters = await Voters.find({
            Institution: Institution,
            voterCategory: VoterCategory
        })
        if (voters) {
            //update the voters one after the other 
            const restrictVoters = await Voters.updateMany({
                Institution: Institution,
                voterCategory: VoterCategory
            }, {
                $set: {
                    "VoterStatus": "Restricted"
                }
            })
            res.json({
                status: 'success',
                message: 'Voters Suspended successfully'
            })
        } else {
            res.json({
                status: 'error',
                message: 'Could not locate voters'
            })
        }
    }
}
const FilterVoters = async (req, res) => {
    const { Institution, VoterCategory } = req.body
    if (!Institution || !VoterCategory) {
        res.json({
            status: 'error',
            message: 'Invalid Details Submitted'
        })
    } else {
        //filter the voters using the categories
        let voters;
        if (VoterCategory === 'All') {
            voters = await Voters.find({
                Institution: Institution, VoterStatus: {
                    $ne: 'Deleted'
                }
            }, {
                __v: 0,
                _id: 0
            })
        } else {
            voters = await Voters.find({
                Institution: Institution, voterCategory: VoterCategory, VoterStatus: {
                    $ne: 'Deleted'
                }
            }, {
                __v: 0,
                _id: 0
            })
        }
        res.json({
            status: 'success',
            message: 'Voters successfully fetched',
            data: voters
        })

    }
}
const ActivateVoters = async (req, res) => {
    //get the posted voter category and the institution 
    const { Institution, VoterCategory } = req.body
    if (!Institution || !VoterCategory) {
        res.json({
            status: 'error',
            message: 'Invalid Details Submitted'
        })
    } else {
        //check if the voters exists 
        const voters = await Voters.find({
            Institution: Institution,
            voterCategory: VoterCategory
        })
        if (voters) {
            //update the voters one after the other 
            const restrictVoters = await Voters.updateMany({
                Institution: Institution,
                voterCategory: VoterCategory
            }, {
                $set: {
                    "VoterStatus": "Active"
                }
            })
            res.json({
                status: 'success',
                message: 'Voters Activated successfully'
            })
        } else {
            res.json({
                status: 'error',
                message: 'Could not locate voters'
            })
        }
    }
}
const DeleteVoters = async (req, res) => {
    const { Institution, VoterCategory } = req.body
    if (!Institution || !VoterCategory) {
        res.json({
            status: 'error',
            message: 'Invalid Data Submitted'
        })
    } else {
        if (VoterCategory === "All") {
            const result = await Voters.updateMany({
                Institution: Institution
            }, {
                $set: {
                    VoterStatus: 'Deleted'
                }
            });
        } else {
            const result = await Voters.updateMany({
                Institution: Institution,
                voterCategory: VoterCategory
            }, {
                $set: {
                    VoterStatus: 'Deleted'
                }
            });
        }

        res.json({
            status: 'success',
            message: `${VoterCategory} Voters In ${Institution} Successfully Deleted`
        })
    }
}
module.exports = { PostUsers, InstitututionsUsers, SuspendVoters, FilterVoters, ActivateVoters, PollInstitution, DeleteVoters, ViewAllVoters, DeleteSelectedVoter, InstitutionActivePolls, UploadVoters, SuspendSelectedVoter, ActivateSelectedVoter, SuspendVoterCategory }