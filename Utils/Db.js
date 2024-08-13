const mongoose = require('mongoose');
require('dotenv').config()
//connect to the mongo database
const ConnectDb = async ()=>{
    //chekc the environment 
    let dbUrl = ""
    if(process.env.ENVIRONMENT==="local"){
        dbUrl = process.env.localEnvironmentDbUrl
    }else{
        dbUrl = process.env.MONGODB_URL
    }
    try{
        await mongoose.connect(dbUrl);
        console.log('Connected to MongoDB');
    }catch(err){
        console.log(err);
    }
}

module.exports = ConnectDb;