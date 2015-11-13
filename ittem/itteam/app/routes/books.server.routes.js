'use strict';

module.exports = function (app) {
	var books = require('../../app/controllers/books.server.controller');
	var ft = require('../../app/controllers/featured.server.controller');
	// Book routes
	app.route('/api/books')
		.get(books.list)
		.post(books.create, ft.update);
	app.route('/api/books/:bookId')
		.get(books.canAccessBook, books.read)
		.post(books.canModifyBook, books.addContent)
		.put(books.canModifyBook, books.update, ft.update)
		.delete(books.delete);
	// Bind Book middleware
	app.param('bookId', books.bookByID);

	app.route('/api/authors')
		.get(books.authors);
};
