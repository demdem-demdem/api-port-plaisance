var express = require("express");
var router = express.Router();

const service = require("../services/users");

const privateMiddleware = require("../middleware/private");

router.post("/authenticate", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await service.authenticate(email, password);

    res.cookie('token', result.token, { httpOnly: true, secure: false });

    res.redirect('/dashboard');
  } catch (err) {
    next(err);
  }
});

router.put("/add", privateMiddleware.checkJWT, async (req, res, next) => {
  // Just grabbing the user data from the body
  const user = await service.add(req.body);
  res.status(201).json(user);
});

module.exports = router;
