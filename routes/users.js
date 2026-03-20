var express = require("express");
var router = express.Router();

const service = require("../services/users");

const private = require("../middleware/private");

router.post("/authenticate", service.authenticate);

router.put("/add", private.checkJWT, service.add,);

module.exports = router;
