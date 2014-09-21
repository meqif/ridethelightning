var mocha = require('mocha');
var nock = require('nock');
var push = require('../lib/push');

describe('sendStrikesToSubscriber', function() {
    var strikes = [{ lat: 1, lon: 2 }];
    var subscriber = { token: 'foo', latitude: 1, longitude: 2 };

    before(function(done) {
        nock.disableNetConnect();
        done();
    });

    after(function(done) {
        nock.enableNetConnect();
        done();
    });

    it('sends a notification per strike', function(done) {
        nock.disableNetConnect();
        var scope = nock('https://api.pushbullet.com', {
            reqheaders: {
                'Content-Type': 'application/json'
            }})
            .post('/v2/pushes')
            .reply(200);
        push.sendStrikesToSubscriber({strokes: strikes})(subscriber);
        scope.done();
        done();
    });
});
