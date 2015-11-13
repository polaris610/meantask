'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose'),
	server = require('../../server'),
	User,
	Video;

/**
 * Globals
 */
var user, video;

/**
 * Unit tests
 */
describe('Video Model Unit Tests:', function() {
	before(function (done) {
		server.onReady(function () {
			User = mongoose.model('User');
			Video = mongoose.model('Video');
			done();
		});
	});
	before(function(done) {
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: 'username',
			password: 'password'
		});

		user.save(function() { 
			video = new Video({
				title: {en: 'Video Name', ur: 'Other Video Name'},
				description: {en: 'test video', ur: 'other test video'},
				user: user,
				status: 'open'
			});

			done();
		});
	});

	describe('Method Save', function() {
		it('should be able to save without problems', function(done) {
			return video.save(function(err) {
				should.not.exist(err);
				done();
			});
		});

		it('should be able to show an error when try to save without name', function(done) { 
			video.title = {en: '', ur: ''};

			return video.save(function(err) {
				should.exist(err);
				done();
			});
		});
	});

	after(function(done) { 
		Video.remove().exec();
		User.remove().exec();

		done();
	});
});
