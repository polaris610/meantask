'use strict';

var should = require('should'),
	mongoose = require('mongoose'),
	server = require('../../server'),
	User,
	Post;

var user, post;

describe('Blog Model Unit Tests:', function () {

	before(function (done) {
		server.onReady(function () {
			User = mongoose.model('User');
			Post = mongoose.model('Post');
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

		post = new Post({
			title: {en: 'post title', ur: ''},
			body: {en: 'post content', ur: ''},
			post_language: 'en',
			status: 'open'
		});

		user.save(function() {
			done();
		});
	});

	describe('Method save', function () {
		it('should be able to save without problems', function (done) {
			return post.save(function (err) {
				should.not.exist(err);
				done();
			});
		});

		it('should be able to show an error when try to save without name', function(done) {
			post.title = {en: '', ur: ''};

			return post.save(function(err) {
				should.exist(err);
				done();
			});
		});
	});

	after(function(done) {
		Post.remove().exec();
		User.remove().exec();

		done();
	});
});
