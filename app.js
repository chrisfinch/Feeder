
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

var CONFIG = require('./config.json');

var piblaster = require('pi-blaster.js');

var gpio = require("pi-gpio");

var Twit = require('twit');

var T = new Twit({
	consumer_key: CONFIG['TWIT_CONSUMER_KEY'],
	consumer_secret: CONFIG['TWIT_CONSUMER_SECRET'],
	access_token: CONFIG['TWIT_ACCESS_TOKEN'],
	access_token_secret: CONFIG['TWIT_ACCESS_TOKEN_SECRET']
});

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);

app.get('/tweet', function (req, res) {
	T.post('statuses/update', { status: 'Hello world!' }, function(err, reply) {
		if (!err) {
			res.send(200);
		} else {
			res.send(500, err);
		}
	});
});

var pinOn = function (pin) {
	gpio.open(pin, "output", function(err) {
		gpio.write(pin, 1, function() {
			gpio.close(pin);
		});
	});
};

var pinOff = function (pin) {
	gpio.open(pin, "output", function(err) {
		gpio.write(pin, 0, function() {
			gpio.close(pin);
		});
	});
};

var getDateTime = function () {

    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    // return year + ":" + month + ":" + day + ":" + hour + ":" + min + ":" + sec;
    return hour + ":" + min + ":" + sec;

};

var turnDuration = 500;
var direction = true;

app.get('/feed', function (req, res) {

	if (direction) {
		piblaster.setPwm(23, 0.17);
		direction = false;
	} else {
		piblaster.setPwm(23, 0.13);
		direction = true;
	}

	pinOn(7);

	setTimeout(function () {
		piblaster.setPwm(23, 0);
		pinOff(7);
		res.send(200);

		T.post('statuses/update', { status: 'I just fed the cats at ' + getDateTime() }, function(err, reply) {
			if (!err) {
				res.send(200);
			} else {
				res.send(500, err);
			}
		});

	}, turnDuration);

});

app.get('/turn/:action', function (req, res) {

	// CLOCKWISE piblaster.setPwm(23, 0.13);
	// PAUSE piblaster.setPwm(23, 0.15);
	// ANTICLOCKWISE piblaster.setPwm(23, 0.17);

	if (req.params.action === "left") {

		piblaster.setPwm(23, 0.17);

		pinOn(7);

		setTimeout(function () {
			piblaster.setPwm(23, 0);
			pinOff(7);
			res.send(200);
		}, turnDuration);
		
	} else if (req.params.action === "right") {
		
		piblaster.setPwm(23, 0.13);

		pinOn(7);

		setTimeout(function () {
			piblaster.setPwm(23, 0);
			pinOff(7);
			res.send(200);
		}, turnDuration);
	}

});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
