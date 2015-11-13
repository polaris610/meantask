'use strict';

var should = require('should'),
	mongoose = require('mongoose'),
	server = require('../../server'),
	User,
	Journal1,
	Category;

var user, journal1, category1, category2, subcategory1, subcategory2, subcategory3;

describe('Journal1 Model Unit Tests:', function () {

	before(function (done) {
		server.onReady(function () {
			User = mongoose.model('User');
			Category = mongoose.model('Category');
			Journal1 = mongoose.model('Journal1');
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

		subcategory1 = new Category({
			title: {en: 'subcategory 1 title', ur: 'subcategory 1'},
			content: {en: 'content', ur: 'content ur'}
		});
		subcategory2 = new Category({
			title: {en: 'subcategory 2 title', ur: 'subcategory 2'},
			content: {en: 'content', ur: 'content ur'}
		});
		subcategory3 = new Category({
			title: {en: 'subcategory 2 title', ur: 'subcategory 2'},
			content: {en: 'content', ur: 'content ur'}
		});
		category1 = new Category({
			title: {en: 'category 1 title', ur: 'category 1'},
			content: {en: 'content', ur: 'content ur'},
			subcategorys: [subcategory1, subcategory2]
		});
		category2 = new Category({
			title: {en: 'category 2 title', ur: 'category 2'},
			content: {en: 'content', ur: 'content ur'},
			subcategorys: [subcategory3]
		});

		user.save(function() {
			journal1 = new Journal1({
				article_title: {en: 'Journal Name', ur: 'Journal name UR'},
				article_body: {en: 'test journal', ur: 'test ur'},
				author: user,
				article_status: 'open',
				categories: [category1, category2]
			});

			done();
		});
	});

	describe('Method save', function () {
		it('should be able to save without problems', function (done) {
			return journal1.save(function (err) {
				should.not.exist(err);
				done();
			});
		});

		it('should be able to show an error when try to save without name', function(done) {
			journal1.article_title = {en: '', ur: ''};

			return journal1.save(function(err) {
				should.exist(err);
				done();
			});
		});
	});

	after(function(done) {
		Journal1.remove().exec();
		Category.remove().exec();
		User.remove().exec();
		
		done();
	});
});
