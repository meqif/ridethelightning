var WebSocket = require('ws'),
    https = require('https'),
    _ = require('underscore'),
    async = require('async'),
    express = require('express'),
    bodyParser = require('body-parser');

var remote = 'ws://ws.lightningmaps.org',
    ws = new WebSocket(remote);

// For now, each subscriber is merely their token, in the future they shall be
// composed of both the token and their region for notification
var subscribers = [];

var sendStrike = function (data) {
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

ws.on('open', function() {});

ws.on('message', function(message) {
    var data = JSON.parse(message);
    // console.log("received ", message);

    async.each(subscribers, function(subscriber) {
        // subscriber == { token: '', region: '' }
        var inside = _.filter(data.strokes, function(stroke) {
            return stroke.lat > 36 && stroke.lat < 42 && stroke.lon > 7 && stroke.lon < 9;
        });

        if (!_.isEmpty(inside)) {
            sendStrike(JSON.stringify(inside));
        }
    }, function(err) {
        if (err) {
            console.log("Error detected: ", err);
        } else {
            console.log("Lightning strike notifications sent to all subscribers");
        }
    });
});

var app = express();

// setup body parser
app.use(bodyParser.json());

app.post('/api/v1/subscribe', function(req, res) {
    if (req.param('token')) {
        res.json({message: 'Successfully subscribed'});
    } else {
        res.status(400).json({error: 'Invalid request body'});
    }
});

app.post('/api/v1/unsubscribe', function(req, res) {
    if (req.param('token')) {
        res.json({message: 'Successfully unsubscribed'});
    } else {
        res.status(400).json({error: 'Invalid request body'});
    }
});

var server = app.listen(8080, function() {
    console.log("Listening on port %d", server.address().port);
});
