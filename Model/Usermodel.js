const mongoose = require("mongoose");

const userSchema = require("../Schema/Userschema");
const Usermodel = mongoose.model("user",userSchema);

module.exports = Usermodel;