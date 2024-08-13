const { LoginValidator, RegisterValidator, ResetValidator, RefreshTokenValidator, ResetTokenValidator, updatePasswordValidator } = require("../Utils/Validator")
const createHttpError = require("http-errors")
const bcrypt = require('bcryptjs')
const User = require("../Models/User")
const crypto = require('crypto');
const sendEmail = require('../Utils/EmailSender')
const sendActionEmail = require("../Utils/ActionEmails")
const ResetToken = require('../Models/ResetTokens')
const { generateTokens, generate_refresh_token, verifyRefreshToken } = require('../Utils/JwtManager')
const Institutions = require('../Models/Institutions')
const Category = require('../Models/Categories')
const Voters = require('../Models/Voters')
const Generate_reset_token = (len) => {
    token = crypto.randomBytes(len).toString("hex")
    return token
}
const Register = async (req, res, next) => {
    try {
        const register_details = await RegisterValidator.validateAsync(req.body)
        const users = await User.countDocuments({ email: register_details.email })
        if (users > 0) {
            throw new createHttpError.Conflict("User already exists")
            return
        } else {
            const new_user = new User({
                Name: register_details.Names,
                email: register_details.email,
                password: register_details.password
            })
            const salt = await bcrypt.genSalt(10)
            const new_password = await bcrypt.hash(register_details.password, salt)
            new_user.password = new_password
            await new_user.save()
            res.json({
                status: 'success',
                message: 'user registered successfully'
            })
        }
    } catch (error) {
        next(createHttpError.UnprocessableEntity(error.message))
    }
}
const Login = async (req, res, next) => {
    const institutions = await Institutions.find({ Status: 'Active' }, {
        __v: 0,
        createdAt: 0,
        updatedAt: 0
    })
    try {
        const valid_logins = await LoginValidator.validateAsync(req.body)
        const users = await User.countDocuments({ email: valid_logins.email })
        if (users === 1) {
            const user = await User.findOne({ email: valid_logins.email })
            //if the user status is suspended, return a suspension message 
            if (user.accountStatus !== 'Active') {
                res.json({
                    status: 'error',
                    message: 'Your account has been suspended. Please Contact Us for Help'
                })
            } else {
                const password_match = await bcrypt.compare(valid_logins.password, user.password)
                if (password_match) {
                    const tokens = generateTokens(user)
                    //load the  voters category  from the categories
                    const institutionCategories = await Category.find({ Institution: user.Institution })
                    if(user.Institution==='None'){
                        res.json({
                            status:'error',
                            message:'You have to be registered In an Institution to Log In. Please Contact Us for Help'
                        })
                    }else{
                        let data = { tokens: tokens, username: user.Name, role: user.role, Institution: user.Institution, InstitutionRole: user.UserType, Institutions: institutions, institutionCategories: institutionCategories }
                        res.json(data); 
                    }
                } else {
                    res.json({
                        status: 'error',
                        message: 'Invalid details Provided'
                    })
                }
            }
        } else {
            res.json({
                status: 'error',
                message: 'User Not Found. Please Register and Try Again'
            })
        }
    } catch (error) {
        res.json({
            status: 'error',
            message: 'Unknown Error Occurred. Please Try Again'
        })
    }
}
const Reset = async (req, res, next) => {
    try {
        const valid_details = await ResetValidator.validateAsync(req.body)
        const user = await User.findOne({ email: valid_details.email })
        if (user) {
            const reset_token = Generate_reset_token(4)
            const res_token = new ResetToken({
                token: reset_token,
                user: user.email,
                tokenType: "Reset"
            })
            await res_token.save()
            const email_sent = await sendEmail(user.email, "Reset Your Password", reset_token, "reset")
            res.json({
                status: "success",
                message: "If the email is registered, you will receive a Reset Code"
            })
            return
        } else {
            next(createHttpError("if the email exists, you will get an email to reset your password"))
        }
        res.json({
            data: valid_details
        })
    } catch (e) {
        next(createHttpError.UnprocessableEntity(e.message))
    }
}
const getResetToken = (async (req, res, next) => {
    //get the reset token here 
    try {
        const valid_details = await ResetTokenValidator.validateAsync(req.body)
        //check the token exists in the database
        const token = await ResetToken.findOne({ token: valid_details.token, Status: "Active" })
        if (token) {
            //update the user password 
            const user = await User.findOne({ email: token.user })
            console.log(user)
            const salt = await bcrypt.genSalt(10)
            const new_password = await bcrypt.hash(valid_details.password, salt)
            user.password = new_password
            await user.save()
            //set the token as used
            token.Status = "Used"
            await token.save()
            await sendActionEmail(token.user, "Password Update Success!", `The account ${token.user} password been successfully Updated.<br/>If you did not request this password change, please contact us or change your account details immediately`)
            res.json(({
                "status": "success",
                "message": "password updated"
            }))
        } else {
            next(createHttpError.Unauthorized())
        }
    } catch (e) {
        next(createHttpError.UnprocessableEntity(e.message))
    }
})
const Logout = (req, res) => {
    res.json({
        message: "Log out"
    })
}
const RefreshToken = async (req, res, next) => {
    try {
        //get the refresh token from the body posted
        const valid_token = await ResetTokenValidator.validateAsync(req.body)
        const valid_user = await verifyRefreshToken(valid_token.token, "refresh")
        //then generate new access token and refresh token
        const new_access_tokens = await generateTokens(valid_user)
        res.json(new_access_tokens)

    } catch (e) {
        next(createHttpError.UnprocessableEntity(e.message))
    }
}
const Homepage = (req, res, next) => {
    try {
        res.json({
            data: "Homepage controller"
        })
    } catch (e) {
        next(createHttpError.Unauthorized(e.message))
    }
}
const GetAllUsers = async (req, res) => {
    //get all the users
    const users = await User.find({}, {
        password: 0,
        __v: 0
    })
    res.json({
        status: 'success',
        data: users
    })
}
const SuspendSelectedUsers = async (req, res) => {
    const { userId } = req.body

    //update the user status to suspended 
    if (!userId) {
        res.json({
            status: 'error',
            message: 'Invalid Data Submitted'
        })
    } else {
        const userExists = await User.countDocuments({ 'email': userId })
        if (userExists) {
            const userExists = await User.findOne({ 'email': userId })
            if (userExists.accountStatus === 'Suspended') {
                res.json({
                    status: 'error',
                    message: 'User Already Suspended'
                })
            } else {
                const user = await User.updateOne({ email: userId }, {
                    $set: {
                        accountStatus: 'Suspended'
                    },
                })
                res.json({
                    status: 'success',
                    message: 'User Successfully Suspended'
                })
            }
        } else {
            res.json({
                status: 'error',
                message: 'User Not found'
            })
        }
    }
}
const ActivateSelectedUsers = async (req, res) => {
    const { userId } = req.body

    //update the user status to suspended 
    if (!userId) {
        res.json({
            status: 'error',
            message: 'Invalid Data Submitted'
        })
    } else {
        const userExists = await User.countDocuments({ 'email': userId })
        if (userExists) {
            const userExists = await User.findOne({ 'email': userId })
            if (userExists.accountStatus === 'Active') {
                res.json({
                    status: 'error',
                    message: 'User Already Active'
                })
            } else {
                const user = await User.updateOne({ email: userId }, {
                    $set: {
                        accountStatus: 'Active'
                    },
                })
                res.json({
                    status: 'success',
                    message: 'User Successfully Activated'
                })
            }
        } else {
            res.json({
                status: 'error',
                message: 'User Not found'
            })
        }
    }
}
//get all the user's from an Institution 
const GetInstitutionAllUsers = async (req, res) => {
    const { institution, userType } = req.body
    if (!institution || !userType) {
        res.json({ status: 'error', message: 'Invalid data submitted' })
    } else {
        //get all voters from the institution
        //if type is voters 
        if (userType === 'Voters') {
            const voters = await Voters.find(
                { Institution: institution, VoterStatus: { $ne: "Deleted" } },
                {
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
module.exports = {
    Login, Register, Reset, getResetToken, Logout, RefreshToken, GetAllUsers, Homepage, SuspendSelectedUsers, ActivateSelectedUsers, GetInstitutionAllUsers
}
