'use strict';

// Setting up route
angular.module('search').config(['$stateProvider',
	function($stateProvider) {
		$stateProvider.
			state('search', {
				url: '/search',
				controller: 'SearchController',
				templateUrl: 'modules/search/views/list-search.client.view.html'
			});
	}
]);
