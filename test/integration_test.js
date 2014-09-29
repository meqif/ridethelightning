var sinon = require('sinon');
var mockery = require('mockery');
var lightningMaps = require('../lib/lightningmaps');

describe('Events from lightningmaps', function() {
    var pusherMock;

    before(function() {
        mockery.enable({
            warnOnUnregistered: false,
            useCleanCache: true
        });

        // Emit an event immediately after registering event listener
        var lightningMapsStub = function() {
            var mock = new lightningMaps();
            this.on = function(event, callback) {
                mock.on(event, callback);
                var response = { token: 'foo' };
                callback(JSON.stringify(response));
            };
            return this;
        };
        mockery.registerMock('./lib/lightningmaps', lightningMapsStub);

        // Add a test subscriber
        var SubscriberList = require('../lib/subscriberlist');
        SubscriberList.add('aRandomToken', 0, 0);

        // Stub the pusher
        var pusher = require('../lib/push');
        pusherMock = sinon.mock(pusher);
    });

    after(function() {
        mockery.disable();
    });

    it('are properly iterated through', function() {
        require('../app');
        pusherMock.verify();
    });
});
