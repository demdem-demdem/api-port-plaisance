var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
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
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

app.use(function(req,res,next) {
    res.status(404).json ({name: 'API', version:'1.0', status: 404, message: 'not_found'});
})

module.exports = app;
