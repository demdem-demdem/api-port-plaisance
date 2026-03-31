var express = require("express");
var router = express.Router();

const service = require("../services/users");

const privateMiddleware = require("../middleware/private");

// Almost all the routes that have privateMiddleware.checkJWT in it are protected with an account AND password
// If you're not connected, you're directly redirected to the home page, connect young person!!!!!

// DASHBOARD ONLY ROUTES
// ==========================================
// I didn't know what to do for these routes for the dashboard
// So I made dashboard only routes, that can be accessed on the dashboard. No res.status() needed here.

// GET the 
router.get("/modify/:id", privateMiddleware.checkJWT, async (req, res, next) => {
  try {
    const user = await service.getById(req.params.id);
    res.render("modify_user", {
      title: "Modifier l'utilisateur",
      user: user
    });
  } catch (err) {
    res.redirect(`/dashboard?error=${encodeURIComponent("Utilisateur non trouvé.")}`);
  }
});

// POST to update a user, maybe she changed her name I don't know (trans rights)
router.post("/update/:id", privateMiddleware.checkJWT, async (req, res, next) => {
  try {
    const updatedUser = await service.modify(req.params.id, req.body);
    res.redirect(
      `/dashboard?success=L'utilisateur ${updatedUser.name} a été mis à jour.`
    );
  } catch (err) {
    const msg = err.message === "email_already_exists" ? "Cet email est déjà utilisé." : "Erreur lors de la modification.";
    res.redirect(`/dashboard?error=${encodeURIComponent(msg)}`);
  }
});

// POST to delete users via forms, they got banned for life!!!
router.post("/delete", privateMiddleware.checkJWT, async (req, res, next) => {
  try {
    await service.delete(req.body.id);
    res.redirect(`/dashboard?success=L'utilisateur a été supprimé.`);
  } catch (err) {
    res.redirect("/dashboard?error=Erreur lors de la suppression.");
  }
});


// HYBRID ROUTES (UI & API)
// ==========================================
// These handle the Dashboard and the API because I don't want to
// write the same logic twice. Content negotiation is a thing.

// POST to identify the VIP entering the port
router.post("/authenticate", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await service.authenticate(email, password);

    // Shove the token in a cookie so the browser remembers us
    res.cookie("token", result.token, { httpOnly: true, secure: false });

    // IF IT ACCEPTS HTML IT REDIRECT to the dashboard
    if (req.accepts("html")) {
      return res.redirect("/dashboard");
    }
    // If not then it sends the JSON result for the machine-people
    res.status(200).json(result);
  } catch (err) {
    if (req.accepts("html")) {
      return res.redirect(`/?error=${encodeURIComponent(err.message)}`);
    }
    next(err);
  }
});

// POST to register a new elite member to the yacht club
router.post("/add", privateMiddleware.checkJWT, async (req, res, next) => {
  try {
    const user = await service.add(req.body);
    if (req.accepts("html")) {
      return res.redirect(
        `/dashboard?success=L'utilisateur ${user.name} a été ajouté avec succès !`,
      );
    }
    res.status(201).json(user);
  } catch (err) {
    if (req.accepts("html")) {
      const msg = err.message === "email_already_exists" ? "Cet email est déjà enregistré." : "Erreur lors de l'ajout.";
      return res.redirect(`/dashboard?error=${encodeURIComponent(msg)}`);
    }
    next(err);
  }
});

module.exports = router;
