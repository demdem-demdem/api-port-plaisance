var express = require("express");
var router = express.Router();

// Get all catways
router.get("/", function (req, res, next) {
  res.send("yo thats all the catway lil fella");
});

// Get catway with id
router.get("/:id", function (req, res, next) {
  res.send("Yooo thats a SINGLE catway, crazy");
});

// Add a new catway
router.post("/", function (req, res, next) {
  res.send("yeah you added one, congrats");
});

// Modify a catway
router.put("/:id", function (req, res, next) {
  res.send("Okay you can modify it if you wanna :/");
});

// Delete a catway
router.delete("/:id", function (req, res, next) {
  res.send("Woah okay rude? you killed it? rude.");
});

// RESERVATIONS

// Get reservations for a single catway
router.get("/:id/reservations", function (req, res, next) {
  res.send("yep thats the reservation right");
});

// Get a reservation from a catway
router.get("/:id/reservations/:idReservation", function (req, res, next) {
  res.send("yep, thats this speexific reeservation ahah you btich");
});

// Create a reservation for this catway
router.post("/:id/reservations/", function (req, res, next) {
  res.send("woah ccongrats its created wooooh smart ass");
});

router.delete("/:id/reservations/:idReservation", function (req, res, next) {
  res.send(
    "bahaha you killed it. you fuccking did it. the police is on the way.",
  );
});

module.exports = router;
