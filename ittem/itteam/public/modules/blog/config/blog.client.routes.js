'use strict';

//Setting up route
angular.module('blog').config(['$stateProvider',
	function($stateProvider) {
		// Blog state routing
		$stateProvider.
			state('listBlog', {
				url: '/blog?q&category&limit&sortBy&sortDir',
				controller: 'BlogListController',
				templateUrl: 'modules/blog/views/list-blog.client.view.html'
			}).
			state('createPost', {
				url: '/blog/create',
				controller: 'PostCreateController',
				templateUrl: 'modules/blog/views/create-post.client.view.html',
				data: {
					permissions: {
						only: ['admin', 'reviewer', 'editor'],
						redirectTo: 'signin'
					}
				}
			}).
			state('viewPost', {
				url: '/blog/:postId',
				controller: 'PostViewController',
				templateUrl: 'modules/blog/views/view-post.client.view.html'
			}).
			state('editPost', {
				url: '/blog/:postId/edit',
				templateUrl: 'modules/blog/views/edit-post.client.view.html',
				controller: 'PostEditController',
				resolve: {
					post: ['$stateParams', '$q', 'Post', function ($stateParams, $q, Post) {
						var deffered = $q.defer();
						Post.get({postId: $stateParams.postId}, function (v) {
							deffered.resolve(v);
						});
						return deffered.promise;
					}]
				}
			});
	}
]);
