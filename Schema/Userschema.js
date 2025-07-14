

const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    email:{
          type:String,
        required:true
    },
    password:{
          type:String,
        required:true
    }
});


userSchema.pre("save",async function(next){
    this.password = await  bcrypt.hash(this.password,12);
     next();
  
}

)



module.exports=userSchema;