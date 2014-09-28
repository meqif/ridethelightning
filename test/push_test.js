var nock = require('nock');
var push = require('../lib/push');

describe('sendStrikesToSubscriber', function() {
    var strikesInRange = [{ lat: 1, lon: 2 }];
    var strikesOutsideRange = [{ lat: 10, lon: 2 }];
    var subscriber = { token: 'foo', latitude: 1, longitude: 2 };

    before(function(done) {
        nock.disableNetConnect();
        done();
    });

    after(function(done) {
        nock.enableNetConnect();
        done();
    });

    it('sends a notification per strike if it is in range', function(done) {
        var scope = nock('https://api.pushbullet.com', {
            reqheaders: {
                'Content-Type': 'application/json'
            }})
            .post('/v2/pushes')
            .reply(200);
        push.sendStrikesToSubscriber({strokes: strikesInRange}, subscriber);
        scope.done();
        done();
    });

    it('does not send a notification if it is not in range', function(done) {
        var scope = nock('https://api.pushbullet.com')
            .post('/v2/pushes')
            .reply(200);
        push.sendStrikesToSubscriber({strokes: strikesOutsideRange}, subscriber);

        if (!scope.isDone()) {
            nock.cleanAll();
            done();
        } else {
            throw new Error('Message sent when it should not');
        }
    });
});
