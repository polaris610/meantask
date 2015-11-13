'use strict';

//Setting up route
angular.module('videos').config(['$stateProvider',
	function($stateProvider) {
		// Videos state routing
		$stateProvider.
		state('videosHome', {
			url: '/',
			controller: 'VideosHomeController',
			templateUrl: 'modules/videos/views/home-videos.client.view.html'
		}).
		state('listVideos', {
			url: '/videos?q&category&limit&sortBy&sortDir',
			controller: 'VideosListController',
			templateUrl: 'modules/videos/views/list-videos.client.view.html'
		}).
		state('createVideo', {
			url: '/videos/create',
			controller: 'VideosCreateController',
			templateUrl: 'modules/videos/views/create-video.client.view.html',
			data: {
				permissions: {
					only: ['admin', 'reviewer', 'editor'],
					redirectTo: 'signin'
				}
			}
		}).
		state('viewVideo', {
			url: '/videos/:videoId',
			controller: 'VideosViewController',
			templateUrl: 'modules/videos/views/view-video.client.view.html'
		}).
		state('editVideo', {
			url: '/videos/:videoId/edit',
			templateUrl: 'modules/videos/views/edit-video.client.view.html',
			controller: 'VideosEditController',
			resolve: {
				video: ['$stateParams', '$q', 'Videos', function ($stateParams, $q, Videos) {
					var deffered = $q.defer();
					Videos.get({videoId: $stateParams.videoId}, function (v) {
						deffered.resolve(v);
					});
					return deffered.promise;
				}]
			}
		});
	}
]);
