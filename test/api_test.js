var request = require('supertest'),
    mocha = require('mocha');

var app = require('../app');

describe('POST /api/v1/subscribe', function() {
    it('responds with json', function(done) {
        request(app)
            .post('/api/v1/subscribe')
            .expect('Content-Type', /json/, done);
    });

    it('adds new subscribers', function(done) {
        request(app)
            .post('/api/v1/subscribe')
            .send({ token: 'foo', location: { latitude: 1, longitude: 1 } })
            .expect('Content-Type', /json/)
            .expect(200, done);
    });

    it('does not add a new subscriber without location', function(done) {
        request(app)
            .post('/api/v1/subscribe')
            .send({ token: 'bar'})
            .expect('Content-Type', /json/)
            .expect(400, done);
    });

    describe('with a populated subscriber list', function() {
        request(app)
            .post('/api/v1/subscribe')
            .send({ token: 'foo', location: { latitude: 1, longitude: 1 } });

        it('overwrites existing subscribers on resubscription', function(done) {
            request(app)
                .post('/api/v1/subscribe')
                .send({ token: 'foo', location: { latitude: 1, longitude: 1 } })
                .expect('Content-Type', /json/)
                .expect(200, done);
        });
    });
});

describe('POST /api/v1/unsubscribe', function() {
    it('refuses malformed requests', function(done) {
        request(app)
            .post('/api/v1/unsubscribe')
            .send()
            .expect(400, done);
    });

    describe('with a populated subscriber list', function() {
        request(app)
            .post('/api/v1/subscribe')
            .send({ token: 'foo', location: { latitude: 1, longitude: 1 } });

        it('does not remove non-existent subscribers', function(done) {
            request(app)
                .post('/api/v1/unsubscribe')
                .send({ token: 'bar' })
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it('removes existing subscribers', function(done) {
            request(app)
                .post('/api/v1/unsubscribe')
                .send({ token: 'foo' })
                .expect('Content-Type', /json/)
                .expect(200, done);
        });
    });
});
