'use strict';

//Setting up route
angular.module('books').config(['$stateProvider',
	function($stateProvider) {
		// Books state routing
		$stateProvider.
			state('listBooks', {
				url: '/books?q&category&limit&sortBy&sortDir',
				controller: 'BooksListController',
				templateUrl: 'modules/books/views/list-books.client.view.html'
			}).
			state('createBook', {
				url: '/books/create',
				controller: 'BooksCreateController',
				templateUrl: 'modules/books/views/edit-book.client.view.html',
				data: {
					permissions: {
						only: ['admin', 'reviewer', 'editor'],
						redirectTo: 'signin'
					}
				}
			}).
			state('viewBook', {
				url: '/books/:bookId?chapterNo&subChapterNo',
				controller: 'BooksViewController',
				templateUrl: 'modules/books/views/view-book.client.view.html'
			}).
			state('addContent', {
				url: '/books/:bookId/add',
				controller: 'BooksAddController',
				templateUrl: 'modules/books/views/add-book.client.view.html'
			}).
			state('editBook', {
				url: '/books/:bookId/edit',
				templateUrl: 'modules/books/views/edit-book.client.view.html',
				controller: 'BooksEditController',
				resolve: {
					book: ['$stateParams', '$q', '$location', 'Books', function ($stateParams, $q, $location, Books) {
						var deffered = $q.defer(),
							query = $location.search();
						query.bookId = $stateParams.bookId;
						Books.get(query, function (v) {
							deffered.resolve(v);
						});
						return deffered.promise;
					}]
				}
			});
	}
]);
