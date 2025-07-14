
require("dotenv").config()
const jwt = require("jsonwebtoken");

const token = process.env.Token;


module.exports.craetetoken = (id)=>{
 const tokenval =      jwt.sign({id},token,
    {
        expiresIn:3*24*60*60
    }
 )
 
 return tokenval

 
}