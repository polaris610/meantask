'use strict';

var MIN_QUERY_LEN = 2;

angular.module('core', ['ui.bootstrap'])

	.controller('HeaderController', ['$scope', '$location', 'Authentication', 'Menus', '_', '$modal',
	function($scope, $location, Authentication, Menus, _, $modal) {
		var oldSearchText, searchParams;

		// == Menus. ==
		$scope.authentication = Authentication;
		$scope.isCollapsed = false;
		$scope.menu = Menus.getMenu('topbar');

		$scope.toggleCollapsibleMenu = function() {
			$scope.isCollapsed = !$scope.isCollapsed;
		};
		// Check role of the user for show/hide admin menu
		$scope.shouldDisplay = function (user) {
			if (_.indexOf(user.roles, 'admin') !== -1) {
				return true;
			}
		};
		// Collapsing the menu after navigation
		$scope.$on('$stateChangeSuccess', function() {
			$scope.isCollapsed = false;
		});

		// == Searching. ==
		searchParams = $location.search();
		$scope.search = {};
		if ('q' in searchParams) {
			$scope.search.text = searchParams.q;
			oldSearchText = searchParams.q;
		} else {
			$scope.search.text = '';
			oldSearchText = '';
		}

		// @TODO: move to service or something.
		$scope.querySearch = function (ignorePrev) {
			var queryText = _.trim($scope.search.text),
				params = {},
				ignr = ignorePrev || false;
			if (
					(ignr || queryText !== oldSearchText) && queryText.length > MIN_QUERY_LEN
					//oldSearchText.length > 0 && queryText.length === 0
			) {
				oldSearchText = queryText;
				if (queryText.length > 0) {
					_.extend(params, $location.search());
					params.q = queryText;
					if (params.chapterNo) delete params.chapterNo;
					if (params.category) delete params.category;
					if (params.subChapterNo) delete params.subChapterNo;
				}
				if ($location.path() !== '/search'){
					$location.path('/search').search(params);
				} else {
					$location.search(params);
				}

			}
		};
		//Sign in modal window
		$scope.openModal = function (size, event) {
			var modalInstance = $modal.open({
				animation: true,
				templateUrl: '/modules/users/views/authentication/signin.client.view.html',
				controller: 'SinginController',
				size: size
			});

		};

		//Search window
		$scope.openSearch = function (size, event) {
			var modalInstance = $modal.open({
				animation: true,
				templateUrl: '/modules/core/views/search.client.view.html',
				controller: 'HeaderController',
				size: size
			});

		};

	}
]);
