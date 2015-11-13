'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose'),
	server = require('../../server'),
	request = require('supertest'),
	dt = require('date-utils'),
	mockVideos = require('../../var/mock_data/videos'),
	app,
	agent,
	User;

var editorUser, authorUser;
var headers = {authorization: 'test'};

describe('Logged-in user:', function () {
	var api_token;

	before(function (done) {
		server.onReady(function () {
			User = mongoose.model('User');
			app = server.getApp();
			agent = request.agent(app);
			done();
		});
	});

	before(function (done) {
		editorUser = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: 'editor_user',
			password: 'password',
			provider: 'local',
			roles: ['editor']
		});
		authorUser = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'author@test.com',
			username: 'author_user',
			password: 'password',
			provider: 'local',
			roles: ['author']
		});

		editorUser.save(function (err) {
			should.not.exist(err);
			authorUser.save(function (err) {
				should.not.exist(err);
				mockVideos[0].author = authorUser._id;
				done();
			});
		});
	});

	it('should be able to login', function (done) {
		agent.post('/api/auth/signin')
			.set(headers)
			.send({ username: 'editor_user', password: 'password' })
			.expect(200)
			.end(function (signinErr, signinRes) {
				if (signinErr) return done(signinErr);
				else {
					api_token = signinRes.body.token;
					done();
				}
			});
	});

	it('should be able to logout', function (done) {
		agent.get('/api/auth/signout')
			.set(headers)
			.end(function (signoutErr, signoutRes) {
				if (signoutErr) return done(signoutErr);
				else done();
			});
	});

	it('should be able to use received token to authenticate', function (done) {
		agent.post('/api/videos')
			.set({authorization: api_token})
			.send(mockVideos[0])
			.expect(200)
			.end(function (postErr) {
				if (postErr) return done(postErr);
				else return done();
			});
	});

	it('should NOT be able to use expired token', function (done) {
		var d = new Date();
		d.removeDays(1);
		editorUser.token = api_token;
		editorUser.token_expires = d;
		editorUser.save(function (err, user) {
			if (err) return done(err);
			else {
				agent.post('/api/videos')
					.set({authorization: api_token})
					.send(mockVideos[0])
					.expect(401)
					.end(function (postErr, postRes) {
						postRes.error.status.should.eql(401);
						done();
					});
			}
		});
	});

	after(function (done) {
		User.remove().exec(function () {
			done();
		});
	});
});
