var WebSocket = require('ws');

var LightningMaps = function() {
    var REMOTE_ENDPOINT = 'ws://ws.lightningmaps.org';

    this.ws = new WebSocket(REMOTE_ENDPOINT);

    return this;
};

LightningMaps.prototype.on = function(event, callback) {
    this.ws.on('message', callback);
};

module.exports = LightningMaps;
