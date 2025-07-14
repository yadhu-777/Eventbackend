
const mongoose = require("mongoose");
const Usermodel = require("../Model/Usermodel");



const EventSchema = new mongoose.Schema ({

date:{
    type:Date,
default:Date.now()
},

    title:{
        type:String,
        required:true
    },
     description:{
        type:String,
        required:true
    },
     price:{
        type:Number,
        required:true
    },
     location:{
        type:String,
        required:true
    },
    imageUrl:{
        type:String,
        required:true
    },
    owner:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"user"
        
    }

});


module.exports = EventSchema;