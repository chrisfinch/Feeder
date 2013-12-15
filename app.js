
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

var gpio = require("pi-gpio");

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
app.get('/users', user.list);

app.get('/led/:action', function (req, res) {

	if (req.params.action === "on") {
		gpio.open(16, "output", function(err) {        // Open pin 16 for output
			gpio.write(16, 1, function() {            // Set pin 16 high (1)
				res.render('index', { title: 'Turned on!' });
				gpio.close(16);                        // Close pin 16
			});
		});
	} else if (req.params.action === "off") {
		gpio.open(16, "output", function(err) {        // Open pin 16 for output
			gpio.write(16, 0, function() {            // Set pin 16 high (1)
				res.render('index', { title: 'Turned off!' });
				gpio.close(16);                        // Close pin 16
			});
		});
	}

});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
