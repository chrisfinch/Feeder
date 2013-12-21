
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

var CONFIG = require('./config.json');

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

var interval;

app.get('/led/:action', function (req, res) {



	if (req.params.action === "on") {
		
		interval = setinterval(function () {
			console.log("doing something");
			gpio.open(16, "output", function(err) {        // Open pin 16 for output
				gpio.write(16, 1, function() {            // Set pin 16 high (1)

					gpio.close(16);                        // Close pin 16
				});
			});
		}, 100);

		res.send(200);		
	} else if (req.params.action === "off") {
		
		clearInterval(interval);

		// gpio.open(16, "output", function(err) {        // Open pin 16 for output
		// 	gpio.write(16, 0, function() {            // Set pin 16 high (1)
		// 		res.send(200);
		// 		gpio.close(16);                        // Close pin 16
		// 	});
		// });
	}

});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
