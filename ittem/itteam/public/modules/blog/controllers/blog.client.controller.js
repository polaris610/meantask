'use strict';

// Blog controller
angular.module('blog')

	.controller('BlogListController', ['$scope', '$stateParams', 'Authentication', 'Post', 'Roles','PageTitle', 'MetaInformation', 'GetterFromServer',
		function ($scope, $stateParams, Authentication, Post, Roles, PageTitle, MetaInformation, GetterFromServer) {
			$scope.authentication = Authentication;
			$scope.Roles = Roles;

			PageTitle.setTitle('Blog');
			MetaInformation.setMetaDescription('Blog');

			GetterFromServer.featured('post').then(function (data) {
				$scope.featured = data.data;
			});

			$scope.find = function () {
				$scope.posts = Post.query($stateParams);
				$scope.canCreate = Roles.hasAtLeastRole('editor');
			};
		}])

	.controller('PostViewController', ['$scope', '$stateParams', '$location', '$sce', 'Authentication', 'Roles', 'Post','PageTitle', 'MetaInformation',
		function ($scope, $stateParams, $location, $sce, Authentication, Roles, Post, PageTitle, MetaInformation) {
			$scope.authentication = Authentication;
			$scope.Roles = Roles;

			$scope.update = function () {
				PageTitle.setTitle($scope.post.title.en);
				MetaInformation.setMetaDescription($scope.post.author.value);
				/*jshint ignore:start*/
				if ($scope.post.author != null) {
					$scope.post.author = $scope.post.author.value;
				}
				/*jshint ignore:end*/

				$scope.canEdit = Roles.hasAtLeastRole('reviewer') || (
					Authentication.user && (
						$scope.post.user === Authentication.user._id ||
						($scope.post.author && $scope.post.author === Authentication.user._id)
					)
				);

				$scope.body = {
					en: $sce.trustAsHtml($scope.post.body.en),
					ur: $sce.trustAsHtml($scope.post.body.ur)
				};
			};

			$scope.findOne = function () {
				$scope.post = Post.get({ postId: $stateParams.postId });
				$scope.post.$promise.then($scope.update);
			};

			$scope.remove = function () {
				if (!$scope.post) return;

				$scope.post.$remove(function () {
					$location.path('blog');
				});
			};

			$scope.close = function () {
				$scope.post.status = 'closed';
				return $scope.post.$update();
			};

			$scope.open = function () {
				$scope.post.status = 'open';
				return $scope.post.$update();
			};
		}])

	.controller('PostCreateController', ['$scope', '$location', 'Authentication', 'PostFormSchema', 'Post','PageTitle', 'MetaInformation',
		function ($scope, $location, Authentication, PostFormSchema, Post, PageTitle, MetaInformation) {
			$scope.authentication = Authentication;
			$scope.postFormSchema = PostFormSchema;
			$scope.post = {};

			PageTitle.setTitle('Create post');
			MetaInformation.setMetaDescription('Create post');

			$scope.create = function (form) {
				var post = new Post($scope.post);

				$scope.$broadcast('schemaFormValidate');
				if (!form.$valid) return;

				post.$save(function (response) {
					$location.path('blog/' + response._id);
				}, function (errorResponse) {
					$scope.error = errorResponse.data.message;
				});
			};
		}])

	.controller('PostEditController', ['$scope', '$location', 'Authentication', 'PostFormSchema', 'post','PageTitle', 'MetaInformation',
		function ($scope, $location, Authentication, PostFormSchema, post, PageTitle, MetaInformation) {
			$scope.authentication = Authentication;
			$scope.post = post;
			$scope.postFormSchema = PostFormSchema;
			/*jshint ignore:start*/
			if (post.author != null) {
				$scope.postFormSchema.schema.properties.author.items = [post.author];
				$scope.post.author = post.author.value;
			}
			/*jshint ignore:end*/

			PageTitle.setTitle('Edit post');
			MetaInformation.setMetaDescription('Edit post');

			// Update existing Post
			$scope.update = function (form) {
				var post = $scope.post;

				$scope.$broadcast('schemaFormValidate');
				if (!form.$valid) return;

				post.$update(function () {
					$location.path('blog/' + post._id);
				}, function (errorResponse) {
					$scope.error = errorResponse.data.message;
				});
			};
		}])
;
