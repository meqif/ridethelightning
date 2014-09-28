var sinon = require('sinon');
var mockery = require('mockery');
var lightningMaps = require('../lib/lightningmaps');

describe('Events from lightningmaps', function() {
    var asyncMock;

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

        var async = require('async');
        asyncMock = sinon.mock(async);
        mockery.registerMock('async', async);
    });

    after(function() {
        mockery.disable();
    });

    it('are properly iterated through', function() {
        asyncMock.expects('each').once().withArgs([]);
        require('../app');
        asyncMock.verify();
    });
});
