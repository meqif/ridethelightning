var async          = require('async'),
    express        = require('express'),
    bodyParser     = require('body-parser'),
    morgan         = require('morgan'),
    lightningMaps  = require('./lib/lightningmaps'),
    push           = require('./lib/push'),
    SubscriberList = require('./lib/subscriberlist');

// Subscribe to updates on lightningmaps and multicast them over to our
// subscribers.

var lightningmaps = new lightningMaps();
lightningmaps.on('message', function(message) {
    var data = JSON.parse(message);
    async.each(SubscriberList.all(), function(subscriber) {
        return push.sendStrikesToSubscriber(data, subscriber);
    });
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
        SubscriberList.add(
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
        if (SubscriberList.remove(req.param('token'))) {
            res.json({message: 'Successfully unsubscribed'});
        } else {
            res.status(400).json({message: 'Subscriber does not exist'});
        }
    } else {
        res.status(400).json({message: 'Invalid request body'});
    }
});

app.use('/api/v1', router);

module.exports = app;
