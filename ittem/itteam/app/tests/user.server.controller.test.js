'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
    mongoose = require('mongoose'),
    server = require('../../server'),
    request = require('supertest'),
    mockUsers = require('../../var/mock_data/users'),
    User,
    app,
    agent;

/**
 * Globals
 */
var user, user2;

/**
 * Unit tests
 */
describe('User server controller:', function () {

    before(function (done) {
        server.onReady(function () {
            User = mongoose.model('User');
            app = server.getApp();
            agent = request.agent(app);

            User.create(mockUsers, function () {
                done();
            });
        });
    });

    it('should list users if logged in as admin', function (done) {
        agent.post('/api/auth/signin')
            .send({username: 'admin_user', password: 'password'})
            .expect(200)
            .end(function (signinErr) {
                if (signinErr) done(signinErr);

                agent.get('/api/users')
                    .expect(200)
                    .end(function (getErr, getRes) {
                        if (getErr) done(getErr);

                        getRes.body.should.be.instanceOf(Array).and.have.lengthOf(6);

                        agent.get('/api/users')
                            .query({'limit' : 2})
                            .expect(200)
                            .end(function (getErr, getRes) {
                                if (getErr) done(getErr);

                                getRes.body.should.be.instanceOf(Array).and.have.lengthOf(2);

                                agent.get('/api/auth/signout')
                                    .expect(302)
                                    .end(done);
                            });
                    });
            });
    });

    it('should not list users if not logged in', function (done) {
        agent.get('/api/users')
            .expect(401)
            .end(function (err) {
                should.not.exist(err);
                if (err) done(err);
                else done();
            });
    });

    after(function(done) {
        User.remove().exec(done);
    });
});
