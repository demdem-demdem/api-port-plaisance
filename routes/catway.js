var express = require("express");
var router = express.Router();
const catwayService = require("../services/catways");
const reservationService = require("../services/reservations");
const privateMiddleware = require("../middleware/private");

// Show the whole list of catways
router.get("/", privateMiddleware.checkJWT, async (req, res, next) => {
  try {
    const catways = await catwayService.getAllCatways();
    res.render('catways_list', { catways });
  } catch (err) {
    next(err);
  }
});

// Get all reservations across all catways
router.get("/reservations", privateMiddleware.checkJWT, async (req, res, next) => {
  try {
    const reservations = await reservationService.getAllReservations();
    res.render('reservations_list', { 
      reservations, 
      catwayId: null 
    });
  } catch (err) {
    next(err);
  }
});

// Get catway with id
router.get("/:id", privateMiddleware.checkJWT, async (req, res, next) => {
  try {
    const catway = await catwayService.getCatwayById(req.params.id);
    res.render('catway_detail', { catway });
  } catch (err) {
    next(err);
  }
});

// Add a new catway
router.post("/", privateMiddleware.checkJWT, async (req, res, next) => {
  try {
    await catwayService.createCatway(req.body);
    res.redirect('/dashboard');
  } catch (err) {
    next(err);
  }
});

// Changing the state (broken, ok, whatever)
router.patch("/:id", privateMiddleware.checkJWT, async (req, res, next) => {
  try {
    const updated = await catwayService.patchCatway(req.params.id, { catwayState: req.body.catwayState });
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
});

// Delete a catway
router.delete("/:id", privateMiddleware.checkJWT, async (req, res, next) => {
  try {
    await catwayService.deleteCatway(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// RESERVATIONS

// Get reservations for a single catway
router.get("/:id/reservations", privateMiddleware.checkJWT, async (req, res, next) => {
  try {
    const reservations = await reservationService.getAllReservationsForCatway(req.params.id);
    res.render('reservations_list', { 
      reservations, 
      catwayId: req.params.id 
    });
  } catch (err) {
    next(err);
  }
});

// Get a reservation from a catway
router.get("/:id/reservations/:idReservation", privateMiddleware.checkJWT, async (req, res, next) => {
  try {
    const reservation = await reservationService.getReservationByIdForCatway(req.params.id, req.params.idReservation);
    res.render('reservation_detail', { 
      reservation, 
      catwayId: req.params.id 
    });
  } catch (err) {
    next(err);
  }
});

// Create a reservation for this catway
router.post("/:id/reservations/", privateMiddleware.checkJWT, async (req, res, next) => {
  try {
    await reservationService.createReservation(req.params.id, req.body);
    res.redirect('/dashboard');
  } catch (err) {
    next(err);
  }
});

router.delete("/:id/reservations/:idReservation", privateMiddleware.checkJWT, async (req, res, next) => {
  try {
    await reservationService.deleteReservationForCatway(req.params.id, req.params.idReservation);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
