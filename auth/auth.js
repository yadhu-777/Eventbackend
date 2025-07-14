

const jwt = require("jsonwebtoken");

require("dotenv").config();
const Usermodel = require("../Model/Usermodel");

module.exports.autherise = (req,res,next)=>{
 
    const token = req.cookies.tdtoken;
    
 
    if(!token){
     return   res.json({message:"You are not regitsered"});
       
       
    }


else{
   jwt.verify(token, process.env.Token,async(err,decoded)=>{
 
    if(err){
      
      return res.json({message:"not registered",status:false})
       
    }
    else{
        const user = await Usermodel.findById(decoded.id);
       
        if(user){
             req.user = decoded.id;
         
              
        }
     next()
    }

})

}


}