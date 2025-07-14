const EventSchema = require("../Schema/Schema.js");
const mongoose = require("mongoose");

const Eventmodel = mongoose.model("Eventmodel",EventSchema);

module.exports = Eventmodel;