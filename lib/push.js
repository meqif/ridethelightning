var _ = require('underscore'),
    geo = require('geolib'),
    https = require('https');

// Send strike to a subscriber
var sendStrike = function(token, message) {
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
        type: 'note',
        title: 'Lightning strike',
        body: message
    }));

    req.on('error', function(err) {
        console.log(err);
    });

    req.end();
};

// Send all strikes in a 10km radius to a subscriber
var sendStrikesToSubscriber = function(data, subscriber) {
    var message = _.chain(data.strokes)
        .filter(function(stroke) {
            return geo.isPointInCircle(
                // lightning strike
                { latitude: stroke.lat, longitude: stroke.lon },
                // subscriber's location
                { latitude: subscriber.latitude, longitude: subscriber.longitude },
                // radius in metres
                2000000
            );
        })
        .map(function(stroke) {
            var googleMapsUrl = 'https://maps.google.com/maps?q=' + stroke.lat + ',' + stroke.lon;
            var distance = geo.getDistance(
                // lightning strike
                { latitude: stroke.lat, longitude: stroke.lon },
                // subscriber's location
                { latitude: subscriber.latitude, longitude: subscriber.longitude },
                // accuracy
                10
            );
            return 'Lightning strike ' + distance + ' metres from your location\n' + googleMapsUrl;
        })
        .reduce(function(memo, message) {
            return memo + message + "\n";
        }, '')
        .value();

    if (message) {
        sendStrike(subscriber.token, message);
    }
};

exports.sendStrikesToSubscriber = sendStrikesToSubscriber;
