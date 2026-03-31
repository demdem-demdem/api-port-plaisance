const Reservation = require("../models/reservations");
const Catway = require("../models/catways");

// Creates a Reservation, by searching the catway ID and then creating it
exports.createReservation = async (catwayId, reservationData) => {
  const catway = await Catway.findById(catwayId);
  if (!catway) {
    throw new Error("Catway not found");
  }
  reservationData.catwayNumber = catway.catwayNumber; 
  return await Reservation.create(reservationData);
};

// Get all the reservations
exports.getAllReservations = async () => {
  return await Reservation.find();
};

// Get all the reservations from a single catway!! Its still the same, we search by ID a catway and fetch all the reservations for this cat Id
exports.getAllReservationsForCatway = async (catwayId) => {
  const catway = await Catway.findById(catwayId);
  if (!catway) {
    throw new Error("Catway not found");
  }
  return await Reservation.find({ catwayNumber: catway.catwayNumber });
};

// Almost the same, but we seek for a single reservation that is made especially for a catway!!
exports.getReservationByIdForCatway = async (catwayId, reservationId) => {
  
  const catway = await Catway.findById(catwayId );
  if (!catway) {
    throw new Error("Catway not found");
  }
  const reservation = await Reservation.findOne({
    _id: reservationId,
    catwayNumber: catway.catwayNumber,
  });
  if (!reservation) {
    throw new Error("Reservation not found for this catway");
  }
  return reservation;
};

// Delete this really really specific reservation
exports.deleteReservationForCatway = async (catwayId, reservationId) => {
  const catway = await Catway.findById(catwayId);
  if (!catway) {
    throw new Error("Catway not found");
  }
  const result = await Reservation.deleteOne({
    _id: reservationId,
    catwayNumber: catway.catwayNumber,
  });
  if (result.deletedCount === 0) {
    throw new Error("Reservation not found for this catway");
  }
  return { message: "Reservation deleted successfully" };
};