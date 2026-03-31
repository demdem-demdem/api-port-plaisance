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
    
    res.redirect('/dashboard');
  } catch (err) {
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
  res.render('dashboard', { title: 'Tableau de Bord' });
});

router.use('/users', userRoute);
router.use('/catway', catwayRoute);

module.exports = router;
