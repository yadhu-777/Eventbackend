const BookingSchema = require("../Schema/Booking");

const mongoose = require("mongoose");

const Bookinfmodel = mongoose.model("book",BookingSchema);

module.exports = Bookinfmodel;