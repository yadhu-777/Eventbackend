
const mongoose = require("mongoose");
const Usermodel = require("../Model/Usermodel");

const BookingSchema = new mongoose.Schema({

title:String,
description:String,
date:Date,
location:String,
userid:{
     type:mongoose.Schema.Types.ObjectId,
   ref: "user"
}




})

module.exports = BookingSchema;