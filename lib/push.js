var _ = require('underscore'),
    geo = require('geolib'),
    https = require('https');

var sendStrike = function(token, strike) {
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
