var WebSocket = require('ws'),
    _ = require('underscore'),
    async = require('async'),
    express = require('express'),
    bodyParser = require('body-parser'),
    morgan = require('morgan'),
    push = require('./lib/push');

// Subscribe to updates on lightningmaps and multicast them over to our
// subscribers.

var remote = 'ws://ws.lightningmaps.org',
    ws = new WebSocket(remote);

var subscribers = [];

ws.on('message', function(message) {
    var data = JSON.parse(message);
    async.each(subscribers, _.partial(push.sendStrikesToSubscriber, data));
});

// API for clients to subscribe to updates
var app = express();

var env = process.env.NODE_ENV || 'development';
/* istanbul ignore if */
if (env === 'development') {
    // Setup logger
    app.use(morgan('combined'));
}

// Setup body parser
app.use(bodyParser.json());

// Handle subscriptions
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
    } else {
        res.status(400).json({error: 'Invalid request body'});
    }
});

// Handle unsubscriptions
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
    } else {
        res.status(400).json({message: 'Invalid request body'});
    }
});

// Launch server
var server = app.listen(8080, function() {
    console.log("Express server listening on port %d in %s mode", server.address().port, env);
});

exports.app = app;
