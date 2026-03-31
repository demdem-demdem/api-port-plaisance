var express = require("express");
var router = express.Router();
const catwayService = require("../services/catways");
const reservationService = require("../services/reservations");
const privateMiddleware = require("../middleware/private");

// Almost all the routes that have privateMiddleware.checkJWT in it are protected with an account AND password
// If you're not connected, you're directly redirected to the home page, connect young person!!!!!

// DASHBOARD ONLY ROUTES
// ==========================================
// I didn't know what to do for these routes for the dashboard
// So I made dashboard only routes, that can be accessed on the dashboard. No res.status() needed here.

// POST to add a reservation
router.post(
  "/reservations/add",
  privateMiddleware.checkJWT,
  async (req, res, next) => {
    try {
      const { catwayId, clientName, boatName, checkIn, checkOut } = req.body;
      await reservationService.createReservation(catwayId, {
        clientName,
        boatName,
        checkIn,
        checkOut,
      });
      res.redirect("/dashboard?success=La réservation a été ajoutée.");
    } catch (err) {
      res.redirect(`/dashboard?error=${encodeURIComponent(err.message)}`);
    }
  },
);

// Post to modify a catway
router.get(
  "/modify/:id",
  privateMiddleware.checkJWT,
  async (req, res, next) => {
    try {
      const catway = await catwayService.getCatwayById(req.params.id);
      res.render("modify_catway", {
        title: "Modifier le catway",
        catway: catway,
      });
    } catch (err) {
      res.redirect(`/dashboard?error=${encodeURIComponent("Catway non trouvé.")}`);
    }
  },
);

// After the modify route as been called, it redirects to the update page, which updates the said catway
router.post(
  "/update/:id",
  privateMiddleware.checkJWT,
  async (req, res, next) => {
    try {
      const updatedCatway = await catwayService.updateCatway(req.params.id, req.body);
      res.redirect(`/dashboard?success=Le catway ${updatedCatway.catwayNumber} a été mis à jour.`);
    } catch (err) {
      res.redirect(`/dashboard?error=${encodeURIComponent(err.message)}`);
    }
  },
);

// POST to delete a specific catway
router.post("/delete", privateMiddleware.checkJWT, async (req, res, next) => {
  try {
    await catwayService.deleteCatway(req.body.id);
    res.redirect("/dashboard?success=Le catway a été supprimé.");
  } catch (err) {
    res.redirect("/dashboard?error=Erreur de suppression.");
  }
});

// POST to delete a specific reservation 
router.get(
  "/:id/reservations/:idReservation/delete",
  privateMiddleware.checkJWT,
  async (req, res, next) => {
    try {
      await reservationService.deleteReservationForCatway(
        req.params.id,
        req.params.idReservation,
      );
      res.redirect("/dashboard?success=La réservation a été supprimée");
    } catch (err) {
      res.redirect("/dashboard?error=Erreur de suppression.");
    }
  },
);

// HYBRID ROUTES (UI & API)
// ==========================================
// These handle the Dashboard and the API because I don't want to
// write the same logic twice. Content negotiation is a thing.

// GET to get (ahah) the listing of the elite's boat parking spots
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

// GET the reservations to see who's parking where
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


// GET a specific catway with its ID to inspect the luxury catway
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


// POST to creating more infrastructure for the 1%
router.post("/", privateMiddleware.checkJWT, async (req, res, next) => {
  try {
    const catway = await catwayService.createCatway(req.body);
    // IF IT ACCEPTS HTML IT REDIRECT to the dashboard with the success message
    if (req.accepts("html")) {
      return res.redirect("/dashboard?success=Le catway a été ajouté.");
    }
    //If not then it send the html code 201, to say its okay :D
    res.status(201).json(catway);
  } catch (err) {
    // If it accepts HTML, its returns the error message
    if (req.accepts("html")) {
      return res.redirect(
        `/dashboard?error=${encodeURIComponent(err.message)}`,
      );
    }
    // If not it sends the error in json
    next(err);
  }
});

// GET the reservations for a specific catway, see who's on this specific catway and if its the one who painted it red for some reason
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

// GET the specific reservation for a specific catway, it's you Jeff I know it, I can see it on the dashboard
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

// POST to create a new reservation for a specific catway :)
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
// ==========================================
// Only JSON and API here, no fancy view
// I didn't have enough resources or money for it, sorry (talk about it to hr)

// PUT to COMPLETLY REPLACE the catway, it updates it COMPLETELY
// Use this when you want to overwrite everything
router.put("/:id", privateMiddleware.checkJWT, async (req, res, next) => {
  try {
    const replaced = await catwayService.updateCatway(req.params.id, req.body);
    res.status(200).json(replaced);
  } catch (err) {
    next(err);
  }
});

// PATCH for partial updates, like when the catway has a big hole in it and is sinking
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

// DELETE the catway. The proper way to destroy the catway. Thank our dear lord the Vourme
router.delete("/:id", privateMiddleware.checkJWT, async (req, res, next) => {
  try {
    await catwayService.deleteCatway(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// DELETE the reservations of a specific catway!!! its really specific!!! okay!!!
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
