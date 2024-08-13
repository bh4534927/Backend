const { Posts } = require('../Models/Candidates')
const { PollsValidator } = require('../Utils/Validator')
const User = require('../Models/User')
const Polls = require("../Models/Polls")
const { Candidates } = require('../Models/Candidates')
const Voters = require("../Models/Voters")
const Votes = require('../Models/Votes')
const Subscription = require('../Models/Subscription')
//get all the polls
//push all the changes to the backend
const Index = async (req, res, next) => {
    const polls = await Polls.find({}, {
        _id: 0,
        __v: 0,
        updatedAt: 0,
    })
    res.json({
        status: 'success',
        polls: polls
    })
}
//post all the polls from the frontend 
const getPolls = async (req, res, next) => {
    let valid_details;
    try {
        valid_details = await PollsValidator.validateAsync(req.body)
    } catch (err) {
        res.status(400).json({
            status: 'error',
            message: 'Invalid Data Submitted'
        })
    }
    //check if the poll exists
    const polls = await Polls.countDocuments({ pollName: valid_details.pollName, Institution: valid_details.Institution, CreatedBy: valid_details.CreatedBy, PollYear: new Date().getFullYear() })
    if (polls > 0) {
        //polls exists
        res.status(422).json({
            status: 'error',
            message: 'Poll Alredy Exists'
        })
    } else {
        //save the polls 
        try {
            const poll = new Polls(valid_details)
            await poll.save()
            if (poll) {
                //created poll
                res.status(201).json({
                    status: 'success',
                    message: 'Poll Successfully Created.'
                })
            } else {
                //could not create poll
                res.status(422).json({
                    status: 'error',
                    message: 'Poll Could not be created'
                })
            }
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: 'Server Error'
            })
        }
    }
}
const LeadersPosts = async (req, res) => {
    //check if in the database there is a nother same post
    const { PostData, Institution } = req.body
    const exists = await Posts.countDocuments({ Post: PostData, Institution: Institution })
    if (exists > 0) {
        //error
        res.json({
            status: 'error',
            message: 'Post Already Exists'
        })
    } else {
        const newPost = new Posts({
            Post: PostData,
            Institution: Institution
        })
        await newPost.save()
        if (newPost) {
            res.json({
                status: 'success',
                message: 'Post Successfully created'
            })
        } else {
            res.json({
                status: 'error',
                message: 'Could not add the Post'
            })
        }
    }

}
const getPosts = async (req, res) => {
    const posts = await Posts.find({}, {
        _id: 0,
        createdAt: 0,
        __v: 0,
        updatedAt: 0,
    })
    res.json({
        data: posts
    })
}
const getInstitutionPosts = async (req, res) => {
    const { Institution } = req.body
    if (!Institution) {
        res.json({
            status: 'error',
            message: 'Invalid data submitted'
        })
    } else {
        const posts = await Posts.find({
            Institution: Institution
        }, {
            _id: 0,
            createdAt: 0,
            __v: 0,
            updatedAt: 0,
        })
        res.json({
            data: posts
        })
    }
}
const deletePolls = async (req, res) => {
    const { userName, pollName } = req.body
    //then find if the poll exists 
    const polls = await Polls.countDocuments({
        pollName: pollName,
    })
    if (polls > 0) {
        //get the user, if the user is an institution admin, delete, else return unauthorised
        const poll = await Polls.updateOne({ pollName: pollName }, {
            $set: {
                PollStatus: 'Deleted',
                UpdatedBy: userName ? userName : 'Administrator'
            },
        })
        res.status(200).json({
            status: 'success',
            message: 'Poll successfully Deleted'
        })

    } else {
        //delete the poll 
        res.status(403).json({
            status: 'error',
            message: 'Could not find the poll'
        })
    }
}
const startPoll = async (req, res) => {
    //check the poll and update the status
    const { userName, pollName } = req.body
    //then find if the poll exists 
    const polls = await Polls.countDocuments({
        pollName: pollName,
        CreatedBy: userName
    })
    if (polls > 0) {
        const active = await Polls.countDocuments({
            CreatedBy: userName,
            PollStatus: 'Started'
        })
        //if active, you have some running 
        if (active > 0) {
            res.status(200).json({
                status: 'error',
                message: 'You have a running poll!'
            })
        } else {
            const poll = await Polls.updateOne({ pollName: pollName, CreatedBy: userName }, {
                $set: {
                    PollStatus: 'Started'
                },
            })
            res.status(200).json({
                status: 'success',
                message: 'Poll successfully Started'
            })
        }

    } else {
        //delete the poll 
        res.status(403).json({
            status: 'error',
            message: 'Could not find the poll'
        })
    }
}
const stopPoll = async (req, res) => {
    //check the poll and update the status
    const { userName, pollName } = req.body
    //then find if the poll exists 
    const polls = await Polls.countDocuments({
        pollName: pollName,
        CreatedBy: userName
    })
    if (polls > 0) {
        const poll = await Polls.updateOne({ pollName: pollName, CreatedBy: userName }, {
            $set: {
                PollStatus: 'End'
            },
        })
        res.status(200).json({
            status: 'success',
            message: 'Poll successfully Ended'
        })

    } else {
        //delete the poll 
        res.status(403).json({
            status: 'error',
            message: 'Could not find the poll'
        })
    }
}
const getPastPolls = async (req, res) => {
    //get the poll name and the institution 
    const { Institution, PollName } = req.body
    if (!Institution || !PollName) {
        res.json({
            status: 'error',
            message: 'Invalid data Submitted'
        })
    } else {
        //load the votes here now
        const voteCounts = await Votes.aggregate([
            {
                $match: {
                    PollName: PollName,
                    Institution: Institution
                }
            },
            {
                $group: {
                    _id: {
                        candidate: "$Candidate",
                        role: "$Role",
                        name: "$CandidateName",
                    },
                    count: { $sum: 1 } // Counting documents for each unique combination of candidate, role, and name
                }
            },
            {
                $group: {
                    _id: "$_id.role", // Grouping by Role from the previous group
                    candidates: {
                        $push: {
                            candidate: "$_id.candidate",
                            name: "$_id.name",
                            count: "$count",
                        }
                    },
                    totalVotes: { $sum: "$count" } // Summing up total votes per Role
                }
            },
            {
                $addFields: {
                    candidates: {
                        $sortArray: { input: "$candidates", sortBy: { count: -1 } }
                    }
                }
            },
            {
                $sort: {
                    _id: 1, // Sorting by role in ascending order
                    totalVotes: -1 // Sorting by totalVotes in descending order
                }
            }
        ]);

        res.json({
            status: 'success',
            data: voteCounts
        })
    }
}
const getActivePollVotes = async (req, res) => {
    const { institution } = req.body
    if (!institution) {
        res.json({
            status: 'error',
            message: 'Invalid data Submitted'
        })
    } else {
        const poll = await Polls.findOne({
            Institution: institution,
            PollStatus: "Started"
        }, {
            __v: 0,
            createdAt: 0,
            updatedAt: 0

        })
        if (!poll) {
            res.json({
                status: 'error',
                message: 'No Running Poll'
            })
        } else {
            //poll exists
            const pollName = poll.pollName
            //load the votes here now
            const voteCounts = await Votes.aggregate([
                {
                    $match: {
                        PollName: pollName,
                        Institution: institution
                    }
                },
                {
                    $group: {
                        _id: {
                            candidate: "$Candidate",
                            role: "$Role",
                            name: "$CandidateName",
                        },
                        count: { $sum: 1 } // Counting documents for each unique combination of candidate, role, and name
                    }
                },
                {
                    $group: {
                        _id: "$_id.role", // Grouping by Role from the previous group
                        candidates: {
                            $push: {
                                candidate: "$_id.candidate",
                                name: "$_id.name",
                                count: "$count",
                            }
                        },
                        totalVotes: { $sum: "$count" } // Summing up total votes per Role
                    }
                },
                {
                    $addFields: {
                        candidates: {
                            $sortArray: { input: "$candidates", sortBy: { count: -1 } }
                        }
                    }
                },
                {
                    $sort: {
                        _id: 1, // Sorting by role in ascending order
                        totalVotes: -1 // Sorting by totalVotes in descending order
                    }
                }
            ]);

            res.json({
                status: 'success',
                data: voteCounts
            })
        }

    }

}
const getActivePolls = async (req, res) => {
    //get the active poll for a specific institution
    const { institution } = req.body
    if (!institution) {
        res.json({
            status: 'error',
            message: 'The institution is required'
        })
    } else {
        const poll = await Polls.findOne({
            Institution: institution,
            PollStatus: "Started"
        }, {
            __v: 0,
            createdAt: 0,
            updatedAt: 0

        })
        res.json({
            status: 'success',
            data: poll
        })
    }
}
//if the user is an admin, then this is the route 
const getAllActivePolls = async (req, res) => {
    //get the active poll for a specific institution
    const poll = await Polls.find({
        PollStatus: "Started"
    }, {
        __v: 0,
        createdAt: 0,
        updatedAt: 0

    })
    res.json({
        status: 'success',
        data: poll
    })
}
const VOTE = async (req, res) => {
    let data = {}
    const { Institution, Poll, UniqueID } = req.body
    if (!Institution || !UniqueID || !Poll) {
        res.json({
            status: 'error',
            message: 'Invalid Data Submitted'
        })
    } else {
        //check if the user has already voted 
        //check the poll name and the institution, if the voter exists, they have already voted, else not 
        const hasVoted = await Votes.countDocuments({
            PollName: Poll,
            Institution: Institution,
            Voter: UniqueID

        })
        if (hasVoted === 0) {
            //the person has not voted
            //get the poll status, if its not yet started, exit
            const poll = await Polls.findOne({
                pollName: Poll,
                Institution: Institution
            }, {
                __v: 0,
                createdAt: 0,
                updatedAt: 0

            })
            if (!poll) {
                res.json({
                    error: 'error',
                    message: 'No Poll Found'
                })
            } else {
                if (poll.PollStatus === 'Started') {

                    const voterExists = await Voters.countDocuments({
                        IdNumber: UniqueID
                    })
                    if (voterExists > 0) {
                        const voter = await Voters.findOne({
                            IdNumber: UniqueID
                        })
                        data.voter = voter
                        if (voter.VoterStatus === 'Active') {
                            //load posts here
                            const candidates = await Candidates.aggregate([
                                {
                                    $match: {
                                        CandidateInstitution: Institution,
                                        Poll: Poll,
                                        CandidateStatus: 'Active',
                                        $or: [
                                            { VotedBy: voter.voterCategory },
                                            { VotedBy: "All" }
                                        ]
                                    }
                                },
                                {
                                    $group: {
                                        _id: "$Post",
                                        candidates: { $push: "$$ROOT" }
                                    }
                                }
                            ]);
                            data.candidates = candidates
                            res.json({
                                status: 'success',
                                message: 'Successfully Fetched the candidates',
                                data: data
                            })
                        } else {
                            if (voter.VoterStatus === 'Deleted') {
                                res.json({
                                    status: 'error',
                                    message: 'The Voter Does not Exist'
                                })
                            } else {
                                res.json({
                                    status: 'error',
                                    message: 'The Voter is restricted from Voting'
                                })
                            }
                        }
                    } else {
                        res.json({
                            status: 'error',
                            message: 'Voter Does Not Exist'
                        })
                    }
                } else {
                    res.json({
                        status: 'error',
                        message: 'Can Not Vote. Please Start the Poll'
                    })
                }
            }
        } else {
            //the person has voted
            res.json({
                status: 'error',
                message: 'The Voter has already voted'
            })
        }
    }
}
const RecordVote = async (req, res) => {
    const { Institution, Poll, VotersID, Official, Votesent } = req.body;

    if (!Institution || !VotersID || !Official || Votesent.length === 0) {
        res.json({
            status: 'error',
            message: 'Invalid data Submitted'
        });
        return;
    }

    // Check if the poll is active 
    const poll = await Polls.findOne({
        pollName: Poll,
        Institution: Institution
    });

    if (poll.PollStatus !== 'Started') {
        res.json({
            status: 'error',
            message: 'Poll Not Started'
        });
        return;
    }

    let alreadyVoted = false;
    let limitReached = false;
    let limit = 0;
    //check if the subscription exists, if it exists, set limit reached to false
    const checkSubscription = await Subscription.findOne({
        School: Institution
    })
    if (checkSubscription === null) {
        res.json({
            status: 'error',
            message: `A Subscription is required to Vote`
        })
    } else {
        //if the check subscription exists and its Demo, then set the limit to 10
        if (checkSubscription.SubscriptionType === "Demo") {
            limit = 10
        } else {
            limit = 1000000
        }
        //check if the voter exists in the voter's database
        const voter = await Voters.countDocuments({
            IdNumber: VotersID,
            Institution: Institution,
            VoterStatus: 'Active'
        })
        if (voter === 1) {
            for (const item of Votesent) {
                //count the votes before adding every votes 
                const votesCount = await Votes.countDocuments({
                    Candidate: item.uid,
                    PollName: Poll,
                    Institution: Institution,
                });
                console.log("The limit is " + votesCount)
                if (votesCount === limit) {
                    //check if the limit is reached
                    limitReached = true;
                    break;
                } else {
                    const recordExists = await Votes.countDocuments({
                        Voter: VotersID,
                        Candidate: item.uid,
                        PollName: Poll,
                        Institution: Institution,
                        Role: item.post
                    });

                    if (recordExists > 0) {
                        alreadyVoted = true;
                        break;
                    } else {
                        //get the caandidate details 
                        const cand = await Candidates.findOne({
                            CandidateID: item.uid,
                        })
                        // Save the vote details to the database
                        const vote = new Votes({
                            Voter: VotersID,
                            Candidate: item.uid,
                            CandidateName: cand.CandidateName,
                            PollName: Poll,
                            Institution: Institution,
                            Official: Official,
                            Role: item.post
                        });
                        await vote.save();
                    }
                }
                limit = limit + 1
            }

            if (alreadyVoted) {
                res.json({
                    status: 'error',
                    message: 'Voter already Voted'
                });
            }
            else if (limitReached) {
                res.json({
                    status: 'error',
                    message: 'Please Subscribe to Continue Voting'
                });
            }

            else {
                res.json({
                    status: 'success',
                    message: 'Vote Recorded Successfully'
                });
            }
        } else {
            res.json({
                status: 'error',
                message: 'No Such Voter'
            });
        }
    }
};

const getVotes = async (req, res) => {
    const { Institution, Poll } = req.body
    if (!Institution || !Poll) {
        res.json({
            status: 'error',
            message: 'Invalid Data Submitted'
        })
    } else {
        //then get all the votes from the institution with the candidates 
        const voteCounts = await Votes.aggregate([
            {
                $match: {
                    PollName: Poll,
                    Institution: Institution
                }
            },
            {
                $group: {
                    _id: {
                        candidate: "$Candidate",
                        role: "$Role",
                        name: "$CandidateName"
                    },
                    count: { $sum: 1 } // Counting documents for each unique combination of candidate, role, and name
                }
            },
            {
                $group: {
                    _id: "$_id.role", // Grouping by Role from the previous group
                    candidates: {
                        $push: {
                            candidate: "$_id.candidate",
                            name: "$_id.name",
                            count: "$count"
                        }
                    },
                    totalVotes: { $sum: "$count" } // Summing up total votes per Role
                }
            },
            {
                $sort: {
                    totalVotes: -1, // Sorting by totalVotes in descending order
                    _id: 1
                }
            }
        ]);

        res.json({
            status: 'success',
            message: voteCounts
        })
    }
}
const getInstitutionPolls = async (req,res)=>{
    //request the post data of Institution 
    const {Institution} = req.body
    if(!Institution){
        res.json({
            status:'error',
            message:'Invalid Data Submitted'
        })
    }else{
        //load all the polls from the institution
        const polls = await Polls.find({
            Institution
        })
        res.json({
            status:'success',
            polls:polls
        })
    }
}
module.exports = { Index, getPolls, getPastPolls, getVotes, LeadersPosts, getActivePollVotes, getInstitutionPolls,getInstitutionPosts, getPosts, deletePolls, RecordVote, stopPoll, startPoll, getActivePolls, getAllActivePolls, VOTE }
