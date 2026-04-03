var express = require("express");
var router = express.Router();
const catwayService = require("../services/catways");
const reservationService = require("../services/reservations");
const privateMiddleware = require("../middleware/private");

// Almost all the routes that have privateMiddleware.checkJWT in it are protected with an account AND password
// If you're not connected, you're directly redirected to the home page, connect young person!!!!!

// API & DASHBOARD ROUTES
// ==========================================
// These handle the Dashboard and the API because I don't want to
// write the same logic twice. Content negotiation is a thing.

// GET to get (ahah) the listing of the elite's boat parking spots
router.get("/", privateMiddleware.checkJWT, async (req, res, next) => {
  try {
    const catways = await catwayService.getAllCatways();
    if (req.accepts(['json', 'html']) === 'html') {
      return res.render("catways_list", { catways });
    }
    res.status(200).json(catways);
  } catch (err) {
    if (req.accepts(['json', 'html']) === 'html') {
      return next(err);
    }
    const status = err.message.includes("non trouvé") ? 404 : 500;
    res.status(status).json({ error: err.message });
  }
});

// GET a specific catway with its ID to inspect the luxury catway
router.get("/:id", privateMiddleware.checkJWT, async (req, res, next) => {
  try {
    const catway = await catwayService.getCatwayById(req.params.id);
    if (req.accepts(['json', 'html']) === 'html') {
      return res.render("catway_detail", { catway });
    }
    res.status(200).json(catway);
  } catch (err) {
    if (req.accepts(['json', 'html']) === 'html') {
      return next(err);
    }
    const status = err.message.includes("non trouvé") ? 404 : 500;
    res.status(status).json({ error: err.message });
  }
});

// POST to creating more infrastructure for the 1%
router.post("/", privateMiddleware.checkJWT, async (req, res, next) => {
  try {
    const catway = await catwayService.createCatway(req.body);
    // IF IT ACCEPTS HTML IT REDIRECT to the dashboard with the success message
    if (req.accepts(['json', 'html']) === 'html') {
      return res.redirect("/dashboard?success=Le catway a été ajouté.");
    }
    //If not then it send the html code 201, to say its okay :D
    res.status(201).json(catway);
  } catch (err) {
    // If it accepts HTML, its returns the error message
    if (req.accepts(['json', 'html']) === 'html') {
      return res.redirect(
        `/dashboard?error=${encodeURIComponent(err.message)}`,
      );
    }
    // If not it sends the error in json
    const status = err.message.includes("déjà") ? 409 : 400;
    res.status(status).json({ error: err.message });
  }
});

router.get(
  "/modify/:id",
  privateMiddleware.checkJWT,
  async (req, res, next) => {
    try {
      const catway = await catwayService.getCatwayById(req.params.id);
      if (req.accepts(['json', 'html']) === 'html') {
        return res.render("modify_catway", {
          title: "Modifier le Catway",
          catway: catway,
        });
      }
      res.status(200).json(catway);
    } catch (err) {
      if (req.accepts(['json', 'html']) === 'html') {
        return res.redirect(
          `/dashboard?error=${encodeURIComponent("Catway non trouvé.")}`,
        );
      }
      res.status(404).json({
        error: "Catway non trouvé.",
        message: err.message
    });
    }
  },
);

// PUT to COMPLETLY REPLACE the catway, it updates it COMPLETELY
// Use this when you want to overwrite everything
router.put("/:id", privateMiddleware.checkJWT, async (req, res, next) => {
  try {
    const replaced = await catwayService.updateCatway(req.params.id, req.body);
    if (req.accepts(['json', 'html']) === 'html') {
      return res.redirect(`/dashboard?success=Le catway a été mis à jour.`);
    }
    res.status(200).json(replaced);
  } catch (err) {
    if (req.accepts(['json', 'html']) === 'html') {
      return res.redirect(
        `/dashboard?error=${encodeURIComponent(err.message)}`,
      );
    }
    const status = err.message.includes("non trouvé") ? 404 : 400;
    res.status(status).json({ error: err.message });
  }
});

// PATCH for partial updates, like when the catway has a big hole in it and is sinking
router.patch("/:id", privateMiddleware.checkJWT, async (req, res, next) => {
  try {
    const updated = await catwayService.updateCatway(req.params.id, {
      catwayState: req.body.catwayState,
    });
    if (req.accepts(['json', 'html']) === 'html') {
      return res.redirect(`/dashboard?success=Le catway a été mis à jour.`);
    }
    res.status(200).json(updated);
  } catch (err) {
    // Assuming a patch from dashboard would also redirect to dashboard
    if (req.accepts(['json', 'html']) === 'html') {
      return res.redirect(
        `/dashboard?error=${encodeURIComponent(err.message)}`,
      );
    }
    const status = err.message.includes("non trouvé") ? 404 : 400;
    res.status(status).json({ error: err.message });
  }
});

// DELETE the catway. The proper way to destroy the catway. Thank our dear lord the Vourme
router.delete("/:id", privateMiddleware.checkJWT, async (req, res, next) => {
  try {
    await catwayService.deleteCatway(req.params.id);
    if (req.accepts(['json', 'html']) === 'html') {
      return res.redirect("/dashboard?success=Le catway a été supprimé.");
    }
    res.status(204).send();
  } catch (err) {
    if (req.accepts(['json', 'html']) === 'html') {
      return res.redirect("/dashboard?error=Erreur de suppression.");
    }
    const status = err.message.includes("non trouvé") ? 404 : 400;
    res.status(status).json({ error: "Erreur de suppression.", message: err.message });
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
      if (req.accepts(['json', 'html']) === 'html') {
        return res.render("reservations_list", {
          reservations,
          catwayId: req.params.id,
        });
      }
      res.status(200).json(reservations);
    } catch (err) {
      if (req.accepts(['json', 'html']) === 'html') {
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
      if (req.accepts(['json', 'html']) === 'html') {
        return res.render("reservation_detail", {
          reservation,
          catwayId: req.params.id,
        });
      }
      res.status(200).json(reservation);
    } catch (err) {
      if (req.accepts(['json', 'html']) === 'html') {
        return res.redirect("/dashboard?error=Réservation non trouvée.");
      }
      next(err);
    }
  },
);

// POST to create a new reservation for a specific catway :)
router.post(
  "/:id/reservations",
  privateMiddleware.checkJWT,
  async (req, res, next) => {
    try {
      const reservation = await reservationService.createReservation(
        req.params.id,
        req.body,
      );
      if (req.accepts(['json', 'html']) === 'html') {
        return res.redirect("/dashboard?success=La réservation a été ajoutée.");
      }
      res.status(201).json(reservation);
    } catch (err) {
      if (req.accepts(['json', 'html']) === 'html') {
        return res.redirect(
          `/dashboard?error=${encodeURIComponent(err.message)}`,
        );
      }
      next(err);
    }
  },
);

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
      if (req.accepts(['json', 'html']) === 'html') {
        return res.redirect(
          "/dashboard?success=La réservation a été supprimée",
        );
      }
      res.status(204).send();
    } catch (err) {
      if (req.accepts(['json', 'html']) === 'html') {
        return res.redirect("/dashboard?error=Erreur de suppression.");
      }
      next(err);
    }
  },
);

module.exports = router;
