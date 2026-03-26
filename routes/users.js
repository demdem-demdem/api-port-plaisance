var express = require("express");
var router = express.Router();

const service = require("../services/users");

const privateMiddleware = require("../middleware/private");

router.post("/authenticate", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await service.authenticate(email, password);

    res.cookie("token", result.token, { httpOnly: true, secure: false });

    if (req.accepts("html")) {
      return res.redirect("/dashboard");
    }
    res.status(200).json(result);
  } catch (err) {
    if (req.accepts("html")) {
      return res.redirect(`/?error=${encodeURIComponent(err.message)}`);
    }
    next(err);
  }
});

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

router.post("/delete", privateMiddleware.checkJWT, async (req, res, next) => {
  try {
    await service.delete(req.body.id);
    if (req.accepts("html")) {
      return res.redirect(`/dashboard?success=L'utilisateur a été supprimé.`);
    }
    res.status(200).json({ message: "User deleted" });
  } catch (err) {
    if (req.accepts("html")) {
      return res.redirect("/dashboard?error=Erreur lors de la suppression.");
    }
    next(err);
  }
});

module.exports = router;
