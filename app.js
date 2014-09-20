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

var env = process.env.NODE_ENV || 'development';
if (env === 'development') {
    // setup logger
    app.use(morgan('combined'));
}

// setup body parser
app.use(bodyParser.json());

app.post('/api/v1/subscribe', function(req, res) {
    var hasTokenAndLocation = req.param('token') &&
            req.param('location') &&
            req.param('location').latitude &&
            req.param('location').longitude;

    if (hasTokenAndLocation) {
        var searchProperty = { token: req.param('token') };
        if (_.findWhere(subscribers, searchProperty)) {
            subscribers = _.reject(subscribers, function(el) {
                return el.token === req.param('token');
            });
        }
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
        if (_.findWhere(subscribers, {token: req.param('token') })) {
            subscribers = _.reject(subscribers, function(el) {
                return el.token === req.param('token');
            });
            res.json({message: 'Successfully unsubscribed'});
        } else {
            res.status(400).json({message: 'Subscriber does not exist'});
        }
        console.log("subscribers: ", subscribers);
    } else {
        res.status(400).json({message: 'Invalid request body'});
    }
});

var server = app.listen(8080, function() {
    console.log("Listening on port %d", server.address().port);
});

exports.app = app;
