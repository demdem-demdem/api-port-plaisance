const mongoose = require("mongoose");

const reservationsSchema = mongoose.Schema({
  catwayNumber: { type: Number, required: true },
  clientName: { type: String, required: true },
  boatName: { type: String, required: true },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date },
});

module.exports = mongoose.model("Reservations", reservationsSchema);
