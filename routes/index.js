var express = require('express');
var router = express.Router();
const userRoute = require('../routes/users')
const catwayRoute = require('../routes/catway')

/* GET home page. */
router.get('/', function(req, res, next) {
res.status(200).json({
    name: process.env.APP_NAME,
    version: '1.0',
    status: 200,
    message: 'Welcome on the API!'
  });
});

router.use('/users', userRoute);
router.use('/catway', catwayRoute);

module.exports = router;
