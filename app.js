var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var methodOverride = require('method-override');
const db = require('./db/mongo');

var indexRouter = require('./routes/index');

var app = express();
db.initClientDbConnection();
app.use(cors({
    exposedHeaders: ["Authorization"],
    origin: '*'
}))

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // Look in urlencoded POST bodies and delete it
    var method = req.body._method;
    delete req.body._method;
    return method;
  }
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// Servir la documentation générée par JSDoc
app.use('/documentation', express.static(path.join(__dirname, 'out')));

app.use('/', indexRouter);

app.use(function(req,res,next) {
    res.status(404).json ({name: 'API', version:'1.0', status: 404, message: 'not_found'});
})

module.exports = app;
