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

// Every 3 seconds, check if the state has been set to shutdown and work accordingly.
try {
  while (true) {
    const getState = async() => {
      const state = await axios.get('http://api:8081/state').then((res) => { return res.data.state }).catch(e => {console.log(e)});
      if(state === 'SHUTDOWN') {
        setTimeout(function() {
          process.exit(0);
        }, 2000);
      }
    }
    await new Promise(resolve => setTimeout(resolve, 3000));
    getState();
  }
} catch (e) {
  console.log(e);
}

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({error: err});
});


module.exports = app;
