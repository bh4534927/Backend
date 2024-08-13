const {userRole} = require('./Auth')
const createHttpError = require('http-errors')
const {verifyRefreshToken} = require("../Utils/JwtManager")
//check if the user is  an administrator

const isAdmin = async (req,res,next) =>{
//get the jwt from the headers 
if(!req.headers['authorization']) return next(createHttpError.Unauthorized())
const token = req.headers['authorization'].split(" ")[1]
//verify the jwt
const valid_user = await verifyRefreshToken(token,"access")
//get the user role from the database
const role = await userRole(valid_user.ID)
//if admin, continue,else block
if(role==='writer'){
    next()
}else{
    return next(createHttpError.Unauthorized())
}
}

module.exports = isAdmin