var express = require('express');
var http = require('http');
var config = require('./settings');

var app = express();

app.get('/weather-station/', function(req, res) {
	var temperature = req.query['temp'] / 10;
	var humidity = req.query['humidity'];
	var pressure = req.query['pressure'] / 10;

	if (temperature != 0 && humidity != 0 && pressure != 0) {
		console.log("Pusing to cosm: t=" + temperature + " h="+ humidity + " p=" + pressure);
		var cosm_result = cosm_push(config.cosm_api_key, config.cosm_feed_id, temperature, humidity, pressure, res);
	}
	else {
		res.send("Wrong parameters.");
		console.log("Wrong params");
		console.log(JSON.stringify(req.query));
	}
});

app.listen(config.port);
console.log("Listening on port " + config.port);



function cosm_push(apikey, feedid, temp, humidity, pressure, http_response)
{
	var data = JSON.stringify({
		version: "1.0.0",
		datastreams: [
			{"id":"humidity", "current_value":humidity},
			{"id":"pressure", "current_value":pressure},
			{"id":"temp", "current_value":temp}
		]
	});
	
	var options = {
		hostname: 'api.cosm.com',
		method: 'PUT',
		port: 80,
		headers: {
			'X-ApiKey': apikey,
			'Content-Length': data.length
		},
		path: '/v2/feeds/' + feedid
	};
	
	var req = http.request(options, function(res) {
		console.log("Got response: " + res.statusCode);
		
		http_response.send("Got response:" + res.statusCode);
	});
	req.on('error', function(e) {
		http_response.send("Got error: " + e);
	});
	
	req.write(data);
	req.end();
}
