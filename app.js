var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const expressLayouts = require('express-ejs-layouts')
const session = require('express-session')
const fs = require('fs');
var cors = require('cors')

let admin = false
let user = false
// route setup
var indexRouter = require('./routes/admin');
var usersRouter = require('./routes/users');

var app = express();
const fileUpload = require('express-fileupload')
// mongodb setup
const db = require('./config/connection')

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts) 
app.set('layout', 'layouts/layout');
app.use(logger('dev'));
// app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb',extended: false}));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// session
app.use(session({
  secret:"key",
  resave: true,
  saveUninitialized: true,
  cookie:{max:60000000}
}))
app.use(function(req, res, next) {
  res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  next();
});


app.use(cors())

// mongo connect
db.connect((err)=>{

  if(err) console.log("Connection Error"+err);

  console.log("Database Connected");
})

app.use(fileUpload())

// route 
app.use('/admin', indexRouter);
app.use('/', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error',{admin,user,title:"Error",data:false});
});

module.exports = app;
