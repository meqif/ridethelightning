var _ = require('underscore'),
    geo = require('geolib'),
    https = require('https');

var sendStrike = function(token, strike) {
    var options = {
        hostname: 'api.pushbullet.com',
        port: 443,
        path: '/v2/pushes',
        method: 'POST',
        auth: token + ':',
        headers: {
            'Content-Type': 'application/json'
        }
    };
    var req = https.request(options, function(res) {});

    req.write(JSON.stringify({
        type: 'address',
        title: 'Lightning strike',
        address: strike.lat + ',' + strike.lon
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
                // lightning strike
                { latitude: stroke.lat, longitude: stroke.lon },
                // subscriber's location
                { latitude: subscriber.latitude, longitude: subscriber.longitude },
                // radius in metres
                10000
            );
        });

        _.each(inside, function(strike) { sendStrike(subscriber.token, strike); });
    };
};

exports.sendStrikesToSubscriber = sendStrikesToSubscriber;
