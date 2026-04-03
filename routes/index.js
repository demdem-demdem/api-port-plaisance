var express = require('express');
var router = express.Router();
const userRoute = require('../routes/users')
const serviceUser = require('../services/users')
const catwayRoute = require('../routes/catway')
const privateMiddleware = require('../middleware/private');
const methodOverride = require('method-override')

// Get home page
router.get('/', async (req,res) => {

  res.render('index', {
    title: 'Home'
  })
});

router.use(methodOverride('_method'))

// POST to CONNECT TO THE DASHBOARD!!!!!!
router.post("/authenticate", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await serviceUser.authenticate(email, password);

    // Shove the token in a cookie so the browser remembers us
    res.cookie("token", result.token, { httpOnly: true, secure: false });

    // IF IT ACCEPTS HTML IT REDIRECT to the dashboard
    if (req.accepts(['json', 'html']) === 'html') {
      return res.redirect("/dashboard");
    }
    // If not then it sends the JSON result for the machine-people
    res.status(200).json(result);
  } catch (err) {
    if (req.accepts(['json', 'html']) === 'html') {
      const msg = err.message === "identifiants_incorrects" ? "Identifiants incorrects." : 
                  err.message === "utilisateur_non_trouve" ? "Utilisateur non trouvé." : "Erreur de connexion.";
      return res.redirect(`/?error=${encodeURIComponent(msg)}`);
    }
    let status = 400;
    if (err.message === "identifiants_incorrects") {
      status = 401;
    } else if (err.message === "utilisateur_non_trouve") {
      status = 404;
    }
    res.status(status).json({ error: err.message });
  }
});

// Get to the dashboard, you need to be signed in though!! Don't forget to sign in!!
router.get('/dashboard', privateMiddleware.checkJWT, (req, res) => {
  if (req.accepts(['json', 'html']) === 'html') {
    return res.render('dashboard', { 
      title: 'Tableau de Bord',
      error: req.query.error,
      success: req.query.success
    });
  }
  res.status(200).json({
    message: "Bienvenue sur le tableau de bord",
    error: req.query.error,
    success: req.query.success
  });
});

router.use('/users', userRoute);
router.use('/catways', catwayRoute);

module.exports = router;
