'use strict';

var should = require('should'),
	mongoose = require('mongoose'),
	server = require('../../server'),
	User,
	About;

var user, about;

describe('About Model Unit Tests:', function () {

	before(function (done) {
		server.onReady(function () {
			User = mongoose.model('User');
			About = mongoose.model('About');
			done();
		});
	});

	before(function (done) {
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: 'username',
			password: 'password'
		});

		about = new About({
			title: {en: 'about title', ur: ''},
			body: {en: 'about content', ur: ''},
			about_language: 'en',
			status: 'open'
		});

		user.save(function() {
			done();
		});
	});

	describe('Method save', function () {
		it('should be able to save without problems', function (done) {
			return about.save(function (err) {
				should.not.exist(err);
				done();
			});
		});

		it('should be able to show an error when try to save without name', function(done) {
			about.title = {en: '', ur: ''};

			return about.save(function(err) {
				should.exist(err);
				done();
			});
		});
	});

	after(function(done) {
		About.remove().exec();
		User.remove().exec();

		done();
	});
});
