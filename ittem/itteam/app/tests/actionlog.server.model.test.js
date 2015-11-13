'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose'),
	request = require('supertest'),
	server = require('../../server'),
	mockVideos = require('../../var/mock_data/videos'),
    app,
	agent,
	User, 
	Actionlog;

/**
 * Globals
 */
var editorUser, authorUser, actionlog;
var headers = {authorization: 'test'};

/**
 * Unit tests
 */
describe('Actionlog Model Unit Tests:', function() {
	this.timeout(15000);
	
	before(function (done) {
		server.onReady(function () {
			User = mongoose.model('User');
			Actionlog = mongoose.model('Actionlog');
			app = server.getApp();
			agent = request.agent(app);
			done();
		});
	});

	before(function(done) {
		User.remove().exec();
		Actionlog.remove().exec();

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

		editorUser.save(function (err, usr) {
			should.not.exist(err);
			authorUser.save(function (err) {
				should.not.exist(err);
				mockVideos[0].author = authorUser._id;
				done();
			});
		});
	});

	describe('Some user with enough privileges', function() {
		var video_id;

		it('should be able to login', function (done) {
			agent.post('/api/auth/signin')
				.set(headers)
				.send({ username: 'editor_user', password: 'password' })
				.expect(200)
				.end(function (signinErr, signinRes) {
					if (signinErr) return done(signinErr);
					else return done();
				});
		});

		it('should be able to create video', function (done) {
			agent.post('/api/videos')
				.send(mockVideos[0])
				.expect(200)
				.end(function (postErr, postRes) {
					if (postErr) return done(postErr);
					else {
						video_id = postRes.body._id;
						return done();
					}
				});
		});

		it('should be able to edit video', function (done) {
			var video = {title: {en: 'foobar', ur: ''}};

			agent.put('/api/videos/' + video_id)
				.send(video)
				.expect(200)
				.end(function (putErr, putRes) {
					if (putErr) return done(putErr);
					else return done();
				});
		});

		it('should have appropriate number of actionlog entries', function (done) {
			Actionlog.find({ user: 'editor_user' }).exec(function (err, actionlogs) {
				actionlogs.should.have.length(2);

				actionlogs[0].action.should.eql('post');
				actionlogs[0].resource.should.eql('/api/videos');
				actionlogs[0].user.should.eql('editor_user');
				
				actionlogs[1].action.should.eql('put');
				actionlogs[1].resource.should.eql('/api/videos/' + video_id);
				actionlogs[1].user.should.eql('editor_user');

				done();
			});
		});
	});

	after(function(done) { 
		Actionlog.remove().exec();
		User.remove().exec();

		done();
	});
});
