var _             = require('underscore'),
    async         = require('async'),
    express       = require('express'),
    bodyParser    = require('body-parser'),
    morgan        = require('morgan'),
    lightningMaps = require('./lib/lightningmaps'),
    push          = require('./lib/push');

var subscribers = (function() {
    var subscribers = [];

    return {
        add: function(token, latitude, longitude) {
            var searchProperty = { token: token };
            if (_.findWhere(subscribers, searchProperty)) {
                subscribers = _.reject(subscribers, function(el) {
                    return el.token === token;
                });
            }
            subscribers.push({
                token: token,
                latitude: latitude,
                longitude: longitude
            });
        },

        remove: function(token) {
            var searchProperty = { token: token };
            if (_.findWhere(subscribers, searchProperty)) {
                subscribers = _.reject(subscribers, function(el) {
                    return el.token === token;
                });
                return true;
            } else {
                return false;
            }
        }
    };
})();

// Subscribe to updates on lightningmaps and multicast them over to our
// subscribers.

var lightningmaps = new lightningMaps();
lightningmaps.on('message', function(message) {
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

var router = express.Router();

// Handle subscriptions
router.post('/subscribe', function(req, res) {
    var hasTokenAndLocation = req.param('token') &&
            req.param('location') &&
            req.param('location').latitude &&
            req.param('location').longitude;

    if (hasTokenAndLocation) {
        subscribers.add(
            req.param('token'),
            req.param('location').latitude,
            req.param('location').longitude
        );
        res.json({message: 'Successfully subscribed'});
    } else {
        res.status(400).json({error: 'Invalid request body'});
    }
});

// Handle unsubscriptions
router.post('/unsubscribe', function(req, res) {
    if (req.param('token')) {
        if (subscribers.remove(req.param('token'))) {
            res.json({message: 'Successfully unsubscribed'});
        } else {
            res.status(400).json({message: 'Subscriber does not exist'});
        }
    } else {
        res.status(400).json({message: 'Invalid request body'});
    }
});

app.use('/api/v1', router);

// Launch server
/* istanbul ignore next */
var server = app.listen(8080, function() {
    console.log("Express server listening on port %d in %s mode", server.address().port, env);
});

module.exports = app;
