var mocha          = require('mocha'),
    assert         = require('chai').assert,
    SubscriberList = require('../lib/subscriberlist');

describe('SubscriberList', function() {
    describe('empty', function() {
        var subs = new SubscriberList();
        var token = 'notSoRandomIndentifier';

        it('contains nothing', function() {
            assert.isFalse(subs.contains(token));
        });

        it('cannot remove anything', function() {
            assert.isFalse(subs.remove(token));
        });

        it('can insert new entries', function() {
            subs.add(token, null, null);
            assert.isTrue(subs.contains(token));
        });
    });

    describe('with an entry', function() {
        var subs = new SubscriberList();
        var token = 'notSoRandomIndentifier';

        before(function() {
            subs.add(token);
        });

        it('contains the entry', function() {
            assert.isTrue(subs.contains(token));
        });

        it('can remove the entry', function() {
            assert.isTrue(subs.remove(token));
        });
    });
});
