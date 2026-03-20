var express = require('express');
var router = express.Router();
const userRoute = require('../routes/users')
const serviceUser = require('../services/users')
const catwayRoute = require('../routes/catway')


/* GET home page. */
router.get('/', async (req,res) => {
  /*res.status(200).json({
    name: process.env.APP_NAME,
    version: '1.0',
    status: 200,
    message: 'Welcome on the API!'
  });*/

  res.render('index', {
    title: 'Home'
  })
});


router.post('/authenticate', serviceUser.authenticate);
router.put('/add', serviceUser.add);

router.use('/users', userRoute);
router.use('/catway', catwayRoute);

module.exports = router;
