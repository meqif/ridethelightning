var https = require('https');

var Pushbullet = function(apiKey) {
    var API_BASE = 'api.pushbullet.com';

    this.apiKey = apiKey;
    this.options = {
        hostname: API_BASE,
        port: 443,
        path: '/v2/pushes',
        method: 'POST',
        auth: this.apiKey + ':',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    return this;
};

Pushbullet.prototype.note = function note(title, body, callback) {
    var req = https.request(this.options, callback);
    req.write(JSON.stringify({
        type: 'note',
        title: title,
        body: body
    }));
    req.on('error', callback);
    req.end();
};

module.exports = Pushbullet;
