const {Router} = require('express')
const {Login,Register,Reset,getResetToken,updatePasswords,Logout,RefreshToken,Homepage,GetAllUsers,SuspendSelectedUsers,ActivateSelectedUsers,GetInstitutionAllUsers} = require("../Controllers/AuthController")
const isAdmin = require("../Middlewares/isAdmin")
const AuthRoutes = Router()

AuthRoutes.post("/login",Login)
AuthRoutes.post("/register",Register)
//get the refresh token 
AuthRoutes.post("/refresh",RefreshToken)
//reset sends the token  via the email  address
AuthRoutes.post("/reset",Reset)
//reset-token receives the token back via the post method 
AuthRoutes.post("/reset-password",getResetToken)
AuthRoutes.post("/logout",Logout)
AuthRoutes.get("/",isAdmin,Homepage)
AuthRoutes.get("/Get-All-Users",GetAllUsers)
.post("/Suspend-Selected-Users",SuspendSelectedUsers)
.post("/Activate-Selected-Users",ActivateSelectedUsers)
.post("/Institution-Selected-Users",GetInstitutionAllUsers)
module.exports = AuthRoutes