var express = require("express");
var router = express.Router();
const catwayService = require("../services/catways");
const reservationService = require("../services/reservations");
const privateMiddleware = require("../middleware/private");

// HYBRID ROUTES (The "Whatever" Section)
// These handle the Browser/Dashboard and the API because I don't want to
// write the same logic twice. Content negotiation is a thing.

// GET /catways - Listing the elite's boat parking spots
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

// GET /catways/reservations - See who's parking where
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

// POST /catways/reservations/add - Dashboard specific helper
router.post(
  "/reservations/add",
  privateMiddleware.checkJWT,
  async (req, res, next) => {
    try {
      const { catwayId, clientName, boatName, checkIn, checkOut } = req.body;
      const reservation = await reservationService.createReservation(catwayId, {
        clientName,
        boatName,
        checkIn,
        checkOut,
      });
      if (req.accepts("html")) {
        return res.redirect("/dashboard?success=La réservation a été ajoutée.");
      }
      res.status(201).json(reservation);
    } catch (err) {
      if (req.accepts("html")) {
        return res.redirect(
          `/dashboard?error=${encodeURIComponent(err.message)}`,
        );
      }
      next(err);
    }
  },
);

// GET /catways/:id - Inspecting a single luxury pier
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

router.get(
  "/modify/:id",
  privateMiddleware.checkJWT,
  async (req, res, next) => {
    try {
      const catway = await catwayService.getCatwayById(req.params.id);
      console.log(catway);
      if (req.accepts("html")) {
        return res.render("modify_catway", {
          title: "Modifier le catway",
          catway: catway,
        });
      }
      res.status(200).json(catway);
    } catch (err) {
      if (req.accepts("html")) {
        return res.redirect(
          `/dashboard?error=${encodeURIComponent("Catway non trouvé.")}`,
        );
      }
      next(err);
    }
  },
);

router.post('/update/:id', privateMiddleware.checkJWT, async (req, res, next) => {
  try {
    const updatedCatway = await catwayService.updateCatway(req.params.id, req.body);
    if (req.accepts("html")) {
      return res.redirect(
        `/dashboard?success=Le catway ${updatedCatway.catwayNumber} a été mis à jour.`
      );
    }
    res.status(200).json(updatedCatway);
  } catch (err) {
    if (req.accepts("html")) {
      return res.redirect(`/dashboard?error=${encodeURIComponent(err.message)}`);
    }
    next(err);
  }
});


// POST /catways - Creating more infrastructure for the 1%
router.post("/", privateMiddleware.checkJWT, async (req, res, next) => {
  try {
    const catway = await catwayService.createCatway(req.body);
    if (req.accepts("html")) {
      return res.redirect("/dashboard?success=Le catway a été ajouté.");
    }
    res.status(201).json(catway);
  } catch (err) {
    if (req.accepts("html")) {
      return res.redirect(
        `/dashboard?error=${encodeURIComponent(err.message)}`,
      );
    }
    next(err);
  }
});

// POST /catways/delete - Because HTML forms are stuck in the 90s
// and don't know what a DELETE request is.
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

// GET /catways/:id/reservations - Sub-resource listing
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

// GET /catways/:id/reservations/:idReservation
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

// POST /catways/:id/reservations
router.post(
  "/:id/reservations/",
  privateMiddleware.checkJWT,
  async (req, res, next) => {
    try {
      const reservation = await reservationService.createReservation(
        req.params.id,
        req.body,
      );
      if (req.accepts("html")) {
        return res.redirect("/dashboard?success=La réservation a été ajoutée.");
      }
      res.status(201).json(reservation);
    } catch (err) {
      if (req.accepts("html")) {
        return res.redirect(
          `/dashboard?error=${encodeURIComponent(err.message)}`,
        );
      }
      next(err);
    }
  },
);

// PURE API ROUTES
// Strictly for JSON No fancy html, just data for the hungry machines

// PUT /catways/:id - Total replacement of the object
// Use this when you want to overwrite everything
router.put("/:id", privateMiddleware.checkJWT, async (req, res, next) => {
  try {
    const replaced = await catwayService.updateCatway(req.params.id, req.body);
    res.status(200).json(replaced);
  } catch (err) {
    next(err);
  }
});

// PATCH /catways/:id
// Use this for partial updates, like when the pier is sinking

router.patch("/:id", privateMiddleware.checkJWT, async (req, res, next) => {
  try {
    const updated = await catwayService.updateCatway(req.params.id, {
      catwayState: req.body.catwayState,
    });
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
});

// DELETE /catways/:id The proper way to destroy things
router.delete("/:id", privateMiddleware.checkJWT, async (req, res, next) => {
  try {
    await catwayService.deleteCatway(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// DELETE /catway/:id/reservations/:idReservation
router.delete(
  "/:id/reservations/:idReservation",
  privateMiddleware.checkJWT,
  async (req, res, next) => {
    try {
      await reservationService.deleteReservationForCatway(
        req.params.id,
        req.params.idReservation,
      );
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
);

module.exports = router;
