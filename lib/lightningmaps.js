var WebSocket = require('ws');

var LightningMaps = function() {
    var REMOTE_ENDPOINT = 'ws://ws.lightningmaps.org';

    this.ws = new WebSocket(REMOTE_ENDPOINT);

    return this;
};

LightningMaps.prototype.on = function(event, callback) {
    this.ws.on(event, callback);
};

module.exports = LightningMaps;
