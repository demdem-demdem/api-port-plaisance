const Reservation = require("../models/reservations");
const Catway = require("../models/catways");

exports.createReservation = async (catwayId, reservationData) => {
  const catway = await Catway.findById(catwayId);
  if (!catway) {
    throw new Error("Catway not found");
  }
  reservationData.catwayNumber = catway.catwayNumber; 
  return await Reservation.create(reservationData);
};

exports.getAllReservations = async () => {
  return await Reservation.find();
};

exports.getAllReservationsForCatway = async (catwayId) => {
  const catway = await Catway.findById(catwayId);
  if (!catway) {
    throw new Error("Catway not found");
  }
  return await Reservation.find({ catwayNumber: catway.catwayNumber });
};

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

exports.deleteReservationForCatway = async (catwayId, reservationId) => {
  const catway = await Catway.findById(catwayId);
  console.log(catway)
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