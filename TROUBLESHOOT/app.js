var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var axios = require('axios')

var indexRouter = require('./routes/index');

var app = express();

app.use(logger('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({error: err});
});

// Every 3 seconds, check if the state has been set to shutdown and work accordingly.
const getShutdownMessage = async() => {
  try {
    while (true) {
      await new Promise(resolve => setTimeout(resolve, 3000));
      const state = axios.get('http://api:8081/state').then((res) => { return res.data.state }).catch(e => {throw e});
      if(state === 'SHUTDOWN') {
        process.exit(0);
      }
    }
  } catch (e) {
    console.log(e);
  }
}
getShutdownMessage();


module.exports = app;
