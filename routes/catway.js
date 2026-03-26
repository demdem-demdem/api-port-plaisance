var express = require("express");
var router = express.Router();
const catwayService = require("../services/catways");
const reservationService = require("../services/reservations");
const privateMiddleware = require("../middleware/private");

// Show the whole list of catways
router.get("/", privateMiddleware.checkJWT, async (req, res, next) => {
  try {
    const catways = await catwayService.getAllCatways();
    if (req.accepts("html")) {
      return res.render("catways_list", { catways });
    }
    res.status(200).json(catways);
  } catch (err) {
    next(err);
  }
});

// Get all reservations across all catways
router.get(
  "/reservations",
  privateMiddleware.checkJWT,
  async (req, res, next) => {
    try {
      const reservations = await reservationService.getAllReservations();
      if (req.accepts("html")) {
        return res.render("reservations_list", {
          reservations,
          catwayId: null,
        });
      }
      res.status(200).json(reservations);
    } catch (err) {
      next(err);
    }
  },
);

// Get catway with id
router.get("/:id", privateMiddleware.checkJWT, async (req, res, next) => {
  try {
    const catway = await catwayService.getCatwayById(req.params.id);
    if (req.accepts("html")) {
      return res.render("catway_detail", { catway });
    }
    res.status(200).json(catway);
  } catch (err) {
    next(err);
  }
});

// Add a new catway
router.post("/", privateMiddleware.checkJWT, async (req, res, next) => {
  try {
    const catway = await catwayService.createCatway(req.body);
    if (req.accepts("html")) {
      return res.redirect("/dashboard?success=Le catway a été ajouté.");
    }
    res.status(201).json(catway);
  } catch (err) {
    if (req.accepts("html")) {
      return res.redirect(`/dashboard?error=${encodeURIComponent(err.message)}`);
    }
    next(err);
  }
});

// Changing the state (broken, ok, whatever)
router.patch("/:id", privateMiddleware.checkJWT, async (req, res, next) => {
  try {
    const updated = await catwayService.patchCatway(req.params.id, {
      catwayState: req.body.catwayState,
    });
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
});

// Delete a catway (from dashboard form)
router.post("/delete", privateMiddleware.checkJWT, async (req, res, next) => {
  try {
    await catwayService.deleteCatway(req.body.id);
    if (req.accepts("html")) {
      return res.redirect("/dashboard?success=Le catway a été supprimé.");
    }
    res.status(200).json({ message: "Catway deleted" });
  } catch (err) {
    if (req.accepts("html")) {
      return res.redirect("/dashboard?error=Erreur de suppression.");
    }
    next(err);
  }
});

// Delete a catway
router.delete("/:id", privateMiddleware.checkJWT, async (req, res, next) => {
  try {
    await catwayService.deleteCatway(req.params.id);
    if (req.accepts("html")) {
      return res.redirect("/dashboard?success=Le catway a été supprimé.");
    }
    res.status(204).send();
  } catch (err) {
    if (req.accepts("html")) {
      return res.redirect("/dashboard?error=Erreur de suppression.");
    }
    next(err);
  }
});

// RESERVATIONS

// Get reservations for a single catway
router.get(
  "/:id/reservations",
  privateMiddleware.checkJWT,
  async (req, res, next) => {
    try {
      const reservations = await reservationService.getAllReservationsForCatway(
        req.params.id,
      );
      if (req.accepts("html")) {
        return res.render("reservations_list", {
          reservations,
          catwayId: req.params.id,
        });
      }
      res.status(200).json(reservations);
    } catch (err) {
      if (req.accepts("html")) {
        return res.redirect("/dashboard?error=Catway non trouvé.");
      }
      next(err);
    }
  },
);

// Get a reservation from a catway
router.get(
  "/:id/reservations/:idReservation",
  privateMiddleware.checkJWT,
  async (req, res, next) => {
    try {
      const reservation = await reservationService.getReservationByIdForCatway(
        req.params.id,
        req.params.idReservation,
      );
      if (req.accepts("html")) {
        return res.render("reservation_detail", {
          reservation,
          catwayId: req.params.id,
        });
      }
      res.status(200).json(reservation);
    } catch (err) {
      if (req.accepts("html")) {
        return res.redirect("/dashboard?error=Réservation non trouvée.");
      }
      next(err);
    }
  },
);

// Create a reservation for this catway
router.post(
  "/:id/reservations/",
  privateMiddleware.checkJWT,
  async (req, res, next) => {
    try {
      const reservation = await reservationService.createReservation(req.params.id, req.body);
      if (req.accepts("html")) {
        return res.redirect("/dashboard?success=La réservation a été ajoutée.");
      }
      res.status(201).json(reservation);
    } catch (err) {
      if (req.accepts("html")) {
        return res.redirect(`/dashboard?error=${encodeURIComponent(err.message)}`);
      }
      next(err);
    }
  },
);

router.delete(
  "/:id/reservations/:idReservation",
  privateMiddleware.checkJWT,
  async (req, res, next) => {
    try {
      await reservationService.deleteReservationForCatway(
        req.params.id,
        req.params.idReservation,
      );
      if (req.accepts("html")) {
        return res.redirect("/dashboard?success=La réservation a été supprimée.");
      }
      res.status(204).send();
    } catch (err) {
      if (req.accepts("html")) {
        return res.redirect("/dashboard?error=Erreur de suppression.");
      }
      next(err);
    }
  },
);

module.exports = router;
