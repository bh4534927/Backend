const User = require("../Models/User")

//check if the user is authenticated 
const userRole =async (userID)=>{
    //query the database and return the role of the user 
    const ret_user = await User.findById(userID)
    return ret_user.role
}


module.exports  =  {userRole}