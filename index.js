const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const os = require('os');
const bodyParser = require('body-parser');
const createHttpError = require("http-errors")
require('dotenv').config()
const AuthRoutes = require("./Routes/Auth")
const Institutions = require("./Routes/Institution")
const PollsRouter = require("./Routes/Polls")
const CategoryRoutes = require("./Routes/Category")
const http = require('http');
const socketIo = require('socket.io');
const VotersRouter = require('./Routes/Voters')
const CandidatesRouter = require('./Routes/Candidates')
const Polls = require("./Models/Polls")
const { Candidates } = require('./Models/Candidates')
const Voters = require("./Models/Voters")
const Votes = require('./Models/Votes')
const axios = require('axios');
const app = express()
app.use(bodyParser.json());
require('./Utils/Db')()
const server = http.createServer(app);
let Server;
const getLocalIP = async () => {
    try {
        const response = await axios.get('https://api.ipify.org?format=json');
        const ip = response.data.ip;
        Server=ip
        console.log('Public IP Address:', ip);
    } catch (error) {
        console.error('Error fetching public IP address:', error);
    }
}
console.log(Server)
const io = socketIo(server, {
    cors: {
        origin: "*",
    }
});
io.on('connection', (socket) => {
    //listen for a message from the client 

    //listen for a polls starting 
    socket.on('startPoll', (pollname, insitution) => {
        console.log(`The ${pollname} has  been started in ${insitution}`)
        //then send the message back with the poll stared 
        socket.emit('message', `The ${pollname} has  been started in ${insitution}`)
    })
    console.log('connected to the socket server')
})
const votersNamespace = io.of('/Voters-Socket');
const votesMonitor = io.of('/Votes-Monitor');

votesMonitor.on('connection', (socket) => {
    console.log('connected to the voting monitorAPI');
    // Attach an event listener to the socket
    socket.on('monitor', async (data) => {
        socket.emit('message', 'monitoring the data');

        const { Institution, Poll } = data;

        if (!Institution || !Poll) {
            socket.emit('message', 'Invalid Data Submitted');
        } else {
            // Get all the votes from the institution with the candidates
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
                            Name: "$CandidateName"
                        },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: {
                        count: -1 // Sort by count in descending order
                    }
                }
            ]);

            const resData = {
                status: 'success',
                message: voteCounts
            };

            socket.emit('votes', resData);
        }
    });
});
const Subscription = require('./Models/Subscription')
// Create the voter's namespace
votersNamespace.on('connection', async (socket) => {
    console.log('connected to the voting API');
    //this is the voting route 
    let limitReached = false;
    let limit = 0;
    //check if the subscription exists, if it exists, set limit reached to false

    socket.on('votes', async (data) => {
        // Save the details to the database
        const { Institution, Poll, VotersID, Official, Votesent } = data;

        if (!Institution || !VotersID || !Official || Votesent.length === 0) {
            socket.emit('message', 'Invalid data submitted');
            return;
        }
        const checkSubscription = await Subscription.findOne({
            School: Institution
        })
        if (checkSubscription === null) {
            //if the subscription is not there, add it
            const subscription = new Subscription({
                School: Institution,
                SubscriptionType: "Demo",
                PaymentCode: "Demo"
            })
            await subscription.save()
            //emmit the error message
            socket.emit('message', `Demo Subscription Created. You can Now Start Voting`);
        } else {
            if (checkSubscription.SubscriptionType === "Demo") {
                limit = 20
            } else {
                limit = 1000000
            }
            const poll = await Polls.findOne({
                pollName: Poll,
                Institution: Institution
            });

            if (!poll || poll.PollStatus !== 'Started') {
                socket.emit('message', 'Poll Not Started');
                return;
            }

            let alreadyVoted = false;

            // Check if the voter exists in the voter's database
            const voter = await Voters.countDocuments({
                IdNumber: VotersID,
                Institution: Institution,
                VoterStatus: 'Active'
            });

            if (voter === 1) {
                for (const item of Votesent) {
                    const recordExists = await Votes.countDocuments({
                        Voter: VotersID,
                        Candidate: item.uid,
                        PollName: Poll,
                        Institution: Institution,
                        Role: item.post
                    });
                    const totalVotes = await Votes.countDocuments({
                        PollName: Poll,
                        Institution: Institution,
                    });
                    if (totalVotes > limit) {
                        socket.emit('subscribe', `Please Subscribe to Continue Voting`);
                        limitReached = true;
                        break;
                    } else {
                        if (recordExists > 0) {
                            alreadyVoted = true;
                            break;
                        } else {
                            // Get the candidate details
                            const cand = await Candidates.findOne({
                                CandidateID: item.uid
                            });

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
                            limit = limit + 1
                        }
                    }

                }
                if (alreadyVoted) {
                    socket.emit('error', 'Voter already Voted');
                } else if (limitReached) {
                    socket.emit('subscribe', 'Please Subscribe to Continue Voting');
                }
                else {
                    // Load the votes from the database, use get votes route based on a single institution and the poll
                    const data = {
                        'Institution': Institution,
                        'Poll': Poll
                    };

                    // Emit the monitor event to the votesMonitor namespace
                    votesMonitor.emit('monitor', data);

                    // Post some data to a different route by emitting them
                    socket.emit('message', 'Vote Recorded Successfully');
                }
            } else {
                socket.emit('message', 'No Such Voter');
            }
        }
        // Check if the poll is active
    });
});
app.use(cors())
app.use(morgan('dev'))
app.use(express.json())
app.use("/api", AuthRoutes)
app.use("/api", Institutions)
app.use("/api", PollsRouter)
app.use("/api", CategoryRoutes)
app.use("/api", VotersRouter)
app.use("/api", CandidatesRouter)
//handle any errors here
// if not route exists 
app.use((req, res, next) => {
    next(createHttpError.NotFound("PathNot Found"))
})
app.use(async (err, req, res, next) => {
    res.status = err.status || 500
    res.send({
        error: {
            status: err.isJoi ? err.status = 401 : err.status,
            message: err.message,
            PublicIp:Server,
            Version:"1.5"
        }
    }
    )
})

const PORT = process.env.APP_PORT || 8000
const Appserver = server.listen(PORT, async() => {
    console.log(`Server is running at http://${getLocalIP()}:${PORT}/`);
})

module.exports = Appserver