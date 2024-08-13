const createHttpError = require('http-errors')
const Jwt = require('jsonwebtoken')
//create a method to generate the jwt token 
const generateTokens = (user)=>{
    const payload = {
        user:{
            ID:user.id
        }
    }
    //generate the access token  expires in  i hr
    const access_token = Jwt.sign(payload,process.env.APP_KEY,{
        expiresIn:3600,
        issuer:process.env.APP_NAME
    })
    const refresh_token = generate_refresh_token(user)
    return({
        access_token:access_token,
        refresh_token:refresh_token
    })
}

const generate_refresh_token =  (user) =>{
    const payload = {
        user:{
            id: user.id,
        }
    }
    // 1 year = 12 * 30 *24 *60 *60 seconds 
    const token = Jwt.sign(payload,process.env.REFRESH_KEY,{
        expiresIn:'1y',
        issuer:process.env.APP_NAME
    })
    return token
}
const verifyRefreshToken = (token,tokentype) =>{
    //verify the token here
    let key=""
    if(tokentype ==="access"){
        key = process.env.APP_KEY
    }else{
        key = process.env.REFRESH_KEY
    }
    return new Promise((resolve,reject)=>{
        Jwt.verify(token,key,(err,payload)=>{
            if(err) return reject(createHttpError.Forbidden(err.message))
            const user = payload.user
            resolve(user)
        // const stored_key = await client.GET(user.id,(err,result)=>{
        //     if(err){
        //         return reject(createError.InternalServerError())
        //         return
        //     }
        // })
        // if(stored_key===token){
        //     resolve(user)
        // }else{
        //     reject(createError.Unauthorized())
        // }
        })
    })
}
module.exports = {
    generateTokens,generate_refresh_token,verifyRefreshToken
}