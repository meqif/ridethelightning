var WebSocket = require('ws'),
    https = require('https'),
    _ = require('underscore');

var remote = 'ws://ws.lightningmaps.org',
    ws = new WebSocket(remote);

var subscribers = [];
var last_sent = 0;

function send_strike(data) {
    if (new Date() - last_sent < 5000) { return; }

    last_sent = new Date();
    _.each(subscribers, function(token) {
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
    });
}

ws.on('open', function() {});

ws.on('message', function(message) {
    var data = JSON.parse(message);
    var inside = _.filter(data.strokes, function(stroke) {
        return stroke.lat > 36 && stroke.lat < 42 && stroke.lon > 7 && stroke.lon < 9;
    });
    console.log('received: %s', JSON.stringify(inside));
    send_strike(JSON.stringify(data[0]));
});
