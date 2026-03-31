var express = require("express");
var router = express.Router();

const service = require("../services/users");

const privateMiddleware = require("../middleware/private");

// Almost all the routes that have privateMiddleware.checkJWT in them are protected with an account AND password
// If you're not connected, you're directly redirected to the home page, connect young person!!!!!

// API & DASHBOARD ROUTES
// ==========================================
// These handle the Dashboard and the API because I don't want to
// write the same logic twice. Content negotiation is a thing.

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

// GET the form to modify a user, maybe she changed her name I don't know (trans rights)
router.get("/modify/:id", privateMiddleware.checkJWT, async (req, res, next) => {
  try {
    const user = await service.getById(req.params.id);
    // This route is primarily for HTML rendering, but could theoretically return JSON
    // if req.accepts('json') was checked. For now, assuming HTML only for this GET.
    res.render("modify_user", {
      title: "Modifier l'utilisateur",
      user: user
    });
  } catch (err) {
    // Redirect on error for HTML clients
    res.redirect(`/dashboard?error=${encodeURIComponent("Utilisateur non trouvé.")}`);
  }
});



// PUT to update a user
router.put("/:id", privateMiddleware.checkJWT, async (req, res, next) => {
  try {
    const updatedUser = await service.modify(req.params.id, req.body);
    if (req.accepts("html")) {
      return res.redirect(
        `/dashboard?success=L'utilisateur ${updatedUser.name} a été mis à jour.`
      );
    }
    res.status(200).json(updatedUser);
  } catch (err) {
    if (req.accepts("html")) {
      const msg = err.message === "email_already_exists" ? "Cet email est déjà utilisé." : "Erreur lors de la modification.";
      return res.redirect(`/dashboard?error=${encodeURIComponent(msg)}`);
    }
    next(err);
  }
});

// DELETE to remove a user
router.delete("/:id", privateMiddleware.checkJWT, async (req, res, next) => {
  try {
    // Assuming service.delete takes ID directly from req.params.id
    await service.delete(req.params.id);
    if (req.accepts("html")) {
      return res.redirect(`/dashboard?success=L'utilisateur a été supprimé.`);
    }
    res.status(204).send(); // No content for successful deletion
  } catch (err) {
    if (req.accepts("html")) {
      return res.redirect("/dashboard?error=Erreur lors de la suppression.");
    }
    next(err);
  }
});

module.exports = router;
