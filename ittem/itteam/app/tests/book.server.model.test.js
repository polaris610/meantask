'use strict';

var should = require('should'),
	mongoose = require('mongoose'),
	server = require('../../server'),
	User,
	Book,
	Chapter;

var user, book, chapter1, chapter2, subchapter1, subchapter2, subchapter3;

describe('Book Model Unit Tests:', function () {

	before(function (done) {
		server.onReady(function () {
			User = mongoose.model('User');
			Chapter = mongoose.model('Chapter');
			Book = mongoose.model('Book');
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

		subchapter1 = new Chapter({
			title: {en: 'subchapter 1 title', ur: 'subchapter 1'},
			content: {en: 'content', ur: 'content ur'}
		});
		subchapter2 = new Chapter({
			title: {en: 'subchapter 2 title', ur: 'subchapter 2'},
			content: {en: 'content', ur: 'content ur'}
		});
		subchapter3 = new Chapter({
			title: {en: 'subchapter 2 title', ur: 'subchapter 2'},
			content: {en: 'content', ur: 'content ur'}
		});
		chapter1 = new Chapter({
			title: {en: 'chapter 1 title', ur: 'chapter 1'},
			content: {en: 'content', ur: 'content ur'},
			subchapters: [subchapter1, subchapter2]
		});
		chapter2 = new Chapter({
			title: {en: 'chapter 2 title', ur: 'chapter 2'},
			content: {en: 'content', ur: 'content ur'},
			subchapters: [subchapter3]
		});

		user.save(function() {
			book = new Book({
				title: {en: 'Book Name', ur: 'Book name UR'},
				description: {en: 'test book', ur: 'test ur'},
				user: user,
				status: 'open',
				chapters: [chapter1, chapter2]
			});

			done();
		});
	});

	describe('Method save', function () {
		it('should be able to save without problems', function (done) {
			return book.save(function (err) {
				should.not.exist(err);
				done();
			});
		});

		it('should be able to show an error when try to save without name', function(done) {
			book.title = {en: '', ur: ''};

			return book.save(function(err) {
				should.exist(err);
				done();
			});
		});
	});

	after(function(done) {
		Book.remove().exec();
		Chapter.remove().exec();
		User.remove().exec();

		done();
	});
});
