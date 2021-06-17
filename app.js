var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var indexRouter = require('./routes/index');
var services = require('./routes/service');
var reportsRouter = require('./routes/reports');
var rp = require('request-promise');
var schedule = require('node-schedule');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/reports', reportsRouter);

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
    res.render('error');
});

_startSchedule();

function _startSchedule() {
    var rule = new schedule.RecurrenceRule();
    rule.dayOfWeek = [new schedule.Range(1, 5)];
    rule.hour = [new schedule.Range(9, 18)];
    rule.minute = [new schedule.Range(0, 59)];
    schedule.scheduleJob(rule, function() {
        console.log("SCHEDULE 1");
        services.init();
    });
};

_startMongo();

function _startMongo() {
    var options = {
        keepAlive: 300000,
        connectTimeoutMS: 30000,
        reconnectTries: 30000,
        socketTimeoutMS: 30000
    };
    CONST.MONGO_CLIENT.connect(CONST.MONGO_URL, options)
        .then(function(db) {
            var dbase = db.db('Supervielle_bot');
            dbase.listCollections({name: "bot_log"}, function(err, success){
                if (err) {
                    _createCollection("bot_log");
                } else {
                    console.log("Collection 'bot_log' existe.");
                }
            });
            dbase.listCollections({name: "bot_inactive"}, function(err, success){
                if (err) {
                    _createCollection("bot_inactive");
                } else {
                    console.log("Collection 'bot_inactive' existe.");
                }
            });
            db.close();
        }, function(err) {
            console.log("ERROR:");
            console.log(err);
        });
};


function _createCollection(col) {
    CONST.MONGO_CLIENT.connect(CONST.MONGO_URL, function(err, db) {
        if (err) {
            console.log("ERROR en conexión a la DB.");
        } else {
            var dbase = db.db('Supervielle_bot');
            dbase.createCollection(col, function(err, res) {
                if (err) {
                    console.log("ERROR en la creación de collection.");
                } else {
                    console.log("Collection creada.");
                    db.close();
                }
            });
        }
    });
};

module.exports = app;
