'use strict';

//Setting up route
angular.module('about').config(['$stateProvider',
	function($stateProvider) {
		// About state routing
		$stateProvider.
			state('listAbout', {
				url: '/about?q&category&limit&sortBy&sortDir',
				controller: 'AboutListController',
				templateUrl: 'modules/about/views/list-about.client.view.html'
			}).
			state('createAbout', {
				url: '/about/create',
				controller: 'AboutCreateController',
				templateUrl: 'modules/about/views/create-about.client.view.html',
				data: {
					permissions: {
						only: ['admin', 'reviewer', 'editor'],
						redirectTo: 'signin'
					}
				}
			}).
			state('viewAbout', {
				url: '/about/:aboutId',
				controller: 'AboutViewController',
				templateUrl: 'modules/about/views/view-about.client.view.html'
			}).
			state('editAbout', {
				url: '/about/:aboutId/edit',
				templateUrl: 'modules/about/views/edit-about.client.view.html',
				controller: 'AboutEditController',
				resolve: {
					about: ['$stateParams', '$q', 'About', function ($stateParams, $q, About) {
						var deffered = $q.defer();
						About.get({aboutId: $stateParams.aboutId}, function (v) {
							deffered.resolve(v);
						});
						return deffered.promise;
					}]
				}
			});
	}
]);
