var WebSocket = require('ws'),
    https = require('https'),
    _ = require('underscore'),
    geo = require('geolib'),
    async = require('async'),
    express = require('express'),
    bodyParser = require('body-parser');

var remote = 'ws://ws.lightningmaps.org',
    ws = new WebSocket(remote);

// For now, each subscriber is merely their token, in the future they shall be
// composed of both the token and their region for notification
var subscribers = [];

var sendStrike = function (token, data) {
    var req = https.request({
        hostname: 'api.pushbullet.com',
        port: 443,
        path: '/v2/pushes',
        method: 'POST',
        auth: token + ':',
        headers: {
            'Content-Type': 'application/json'
        }
    }, function(res) {
        console.log('STATUS: ' + res.statusCode);
        console.log('HEADERS: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            console.log('BODY: ' + chunk);
        });
    });

    req.write(JSON.stringify({
        type: 'note',
        title: 'Lightning strike',
        body: data
    }));

    req.on('error', function(err) {
        console.log(err);
    });

    req.end();
};

var sendStrikesToSubscriber = function(data) {
    return function(subscriber) {
        var inside = _.filter(data.strokes, function(stroke) {
            return geo.isPointInCircle(
                { latitude: stroke.lat, longitude: stroke.lon }, // stroke
                { latitude: subscriber.latitude, longitude: subscriber.longitude }, // subscriber's centre
                10000 // radius in metres
            );
        });

        if (!_.isEmpty(inside)) {
            sendStrike(subscriber.token, JSON.stringify(inside));
        }
    };
};

ws.on('open', function() {});

ws.on('message', function(message) {
    var data = JSON.parse(message);

    async.each(subscribers, sendStrikesToSubscriber(data));
});

var app = express();

// setup body parser
app.use(bodyParser.json());

app.post('/api/v1/subscribe', function(req, res) {
    var hasTokenAndLocation = req.param('token') &&
            req.param('location') &&
            req.param('location').latitude &&
            req.param('location').longitude;

    if (hasTokenAndLocation) {
        subscribers.push({
            token: req.param('token'),
            latitude: req.param('location').latitude,
            longitude: req.param('location').longitude
        });
        res.json({message: 'Successfully subscribed'});
        console.log("subscribers: ", subscribers);
    } else {
        res.status(400).json({error: 'Invalid request body'});
    }
});

app.post('/api/v1/unsubscribe', function(req, res) {
    if (req.param('token')) {
        res.json({message: 'Successfully unsubscribed'});
        subscribers = _.without(subscribers, _.findWhere(subscribers, { 'token': req.param('token') }));
        console.log("subscribers: ", subscribers);
    } else {
        res.status(400).json({error: 'Invalid request body'});
    }
});

var server = app.listen(8080, function() {
    console.log("Listening on port %d", server.address().port);
});
