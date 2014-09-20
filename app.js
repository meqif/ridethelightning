var WebSocket = require('ws'),
    https = require('https'),
    _ = require('underscore'),
    async = require('async'),
    express = require('express'),
    bodyParser = require('body-parser'),
    morgan = require('morgan'),
    push = require('./lib/push');

/*
 * Subscribe to updates on lightningmaps and multicast them over to our
 * subscribers.
 */

var remote = 'ws://ws.lightningmaps.org',
    ws = new WebSocket(remote);

var subscribers = [];

ws.on('message', function(message) {
    var data = JSON.parse(message);
    async.each(subscribers, push.sendStrikesToSubscriber(data));
});

/*
 * API for clients to subscribe to updates
 */
var app = express();

// setup body parser
app.use(bodyParser.json());

// setup logger
app.use(morgan('combined'));

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
