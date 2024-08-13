const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
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
const app = express()
require('./Utils/Db')()
const server = http.createServer(app);
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
//create a votes monitoring namespace
const votersNamespace = io.of('/Voters-Socket');
const votesMonitor = io.of('/Votes-Monitor')
votesMonitor.on('connection', (socket) => {
    //attach an event listener to the socket
    socket.on('monitor', async (data) => {
        socket.emit('message','monitoring the data')
        //data to allow monitoringof the votes 
        const { Institution, Poll } = data
        if (!Institution || !Poll) {
            socket.emit('message','Invalid Data Submitted')
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
            const resData  = {
                status: 'success',
                message: voteCounts
            }
            socket.emit('votes',resData)
        }
    })
})
//create the voter's namespace 

votersNamespace.on('connection', (socket) => {
    console.log('connected to the voting API')
    socket.on('votes', async (data) => {
        //save the details to the database 
        const { Institution, Poll, VotersID, Official, Votesent } = data;

        if (!Institution || !VotersID || !Official || Votesent.length === 0) {
            socket.emit('message', 'Invalid data submitted')
            return;
        }

        // Check if the poll is active 
        const poll = await Polls.findOne({
            pollName: Poll,
            Institution: Institution
        });

        if (poll.PollStatus !== 'Started') {
            socket.emit('message', 'Poll Not Started')
            return;
        }

        let alreadyVoted = false;
        //check if the voter exists in the voter's database
        const voter = await Voters.countDocuments({
            IdNumber: VotersID,
            Institution: Institution,
            VoterStatus: 'Active'
        })
        if (voter === 1) {
            for (const item of Votesent) {
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

            if (alreadyVoted) {
                socket.emit('message', 'Voter already Voted')
            } else {
                //load the votes from the database, use get votes route based on a single institution and the poll
                const data = {
                    'Institution':Institutions,
                    'Poll':Poll
                }
                votesMonitor.emit('monitor',data)
                //post some data to a different route by emitting them
                socket.emit('message', 'Vote Recorded Successfully')
            }
        } else {
            socket.emit('message', 'No Such Voter')
        }
    })
})

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
            message: err.message || "Internal Server Error"
        }
    }
    )
})

const PORT = process.env.APP_PORT || 8000
const Appserver = server.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`)
})

module.exports = Appserver