var express = require('express');
var router = express.Router();
const userRoute = require('../routes/users')
const serviceUser = require('../services/users')
const catwayRoute = require('../routes/catway')
const privateMiddleware = require('../middleware/private');


/* GET home page. */
router.get('/', async (req,res) => {

  res.render('index', {
    title: 'Home'
  })
});

router.post('/authenticate', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await serviceUser.authenticate(email, password);

    // Shove the token in a cookie so the browser remembers us
    res.cookie('token', result.token, { httpOnly: true, secure: false }); 
    
    if (req.accepts('html')) {
      return res.redirect('/dashboard');
    }
    res.status(200).json(result);
  } catch (err) {
    if (req.accepts('html')) {
      return res.redirect(`/?error=${encodeURIComponent(err.message)}`);
    }
    next(err);
  }
});

router.put('/add', async (req, res, next) => {
  try {
    const user = await serviceUser.add(req.body);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
});

router.get('/dashboard', privateMiddleware.checkJWT, (req, res) => {
  res.render('dashboard', { 
    title: 'Tableau de Bord',
    error: req.query.error,
    success: req.query.success
  });
});

router.use('/users', userRoute);
router.use('/catway', catwayRoute);

module.exports = router;
