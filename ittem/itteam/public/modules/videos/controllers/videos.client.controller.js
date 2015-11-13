'use strict';

// Videos controller
angular.module('videos')

	.controller('VideosHomeController', ['$scope', '$timeout','Authentication', 'Videos', 'Categories', '_', '$modal', 'PageTitle', 'MetaInformation', 'GetterFromServer',
		function ($scope, $timeout, Authentication, Videos, Categories, _, $modal, PageTitle, MetaInformation, GetterFromServer) {
			$scope.$emit('LOAD');
			var slides = $scope.slides = [];
			$scope.lang = 'en';

			PageTitle.setTitle('Portal');
			MetaInformation.setMetaDescription('The Greatest Worldwide portal');
			$scope.authentication = Authentication;
			$scope.catCloudFontSize = {
				from: 0.3,
				to: 0.7
			};
			GetterFromServer.about().then(function (data) {
				$scope.about = data.data;
			});
			GetterFromServer.featured().then(function (data) {
				$scope.featured = data.data;
			});
			Videos.query({limit: 5, sortBy: 'views', sortDir: 'desc'}, function (videos) {
				_.forEach(videos.data, function (v) {
					slides.push({
						image: 'https://pbs.twimg.com/media/B8_4csiIEAEPKr9.png:large',
						video: v
					});
				});
			});

			Videos.query({ limit: 10, sortBy: 'created', sortDir: 'desc' }, function (videos) {
				$scope.latestVideos = videos.data;
				$scope.$emit('UNLOAD');
				$timeout( showTooltip, 1000);
			});

			Categories.top(function (data) {
				$scope.categories = data;
			}, function (err) {
				console.err(err);
			});
			//Open video modal window
			$scope.open = function (video) {
				$modal.open({
					animation: false,
					keyboard: true,
					template: '<div class="modal-body modal-video embed-responsive"	data-ng-bind-html="videov"><div>',
					controller: 'VideoModalCtrl',
					size: 'md',
					resolve: {
						video: function () {
							return video;
						}
					}
				});
			};
			$scope.changeLang = function () {
				$scope.lang = $scope.lang === 'en'? 'ur': 'en';
			};
			function showTooltip () {
				$scope.tooltip = true;
				$timeout(function () {
					$scope.tooltip = false;
				}, 3000);
			}
		}])
	.controller('VideoModalCtrl',['$scope', '$modalInstance', '$sce', 'video',
		function ($scope, $modalInstance, $sce, video) {
			$scope.videov = $sce.trustAsHtml(video.embed.video);
			angular.element('iframe').addClass('embed-responsive-item');
		}
	])
	.controller('VideosListController', [
		'$scope',
		'$stateParams',
		'$window',
		'Authentication',
		'Videos',
		'Roles',
		'Categories',
		'Authors',
		'$modal',
		'PageTitle',
		'MetaInformation',
		'categoryFilter',
		'_',
		'GetterFromServer',
		'$timeout',
		'$location',
		function ($scope, $stateParams, $window, Authentication, Videos, Roles, Categories, Authors,  $modal, PageTitle, MetaInformation, categoryFilter, _, GetterFromServer, $timeout, $location) {
			// =======  Init ==========
			$scope.$emit('LOAD');
			$scope.authentication = Authentication;
			$scope.Roles = Roles;
			$scope.itemsPerPage = 25;
			PageTitle.setTitle('Videos');
			MetaInformation.setMetaDescription('All category\'s video');
			Authors.query().then(function (result) {
				$scope.authors = result.data;
				$scope.authors.unshift('');
				$scope.selected = null;
				return result.data;
			});
			Categories.top(function (data) {
				$scope.categories = _.sortBy(data, function (cat) {
					return cat.text;
				});
			}, function (err) {
				console.err(err);
			});
			GetterFromServer.featured('video').then(function (data) {
				$scope.featured = data.data;
			});

			// ==========  Watchers ==========
			$scope.$watch('[selectedSubCats, selectedWords, selected]', function (n, o) {
				doFilter(n);
			}, true);
			$scope.$watch('tempVideoArr', function () {
				doFilter([$scope.selectedSubCats, $scope.selectedWords, $scope.selected]);
			}, true);
			$scope.$watch('currentPage', function (n, o) {
				if (n !== o) {
					_.extend($stateParams, {skip: +n-1});
					$scope.find();
					angular.element('html, body').animate({scrollTop: 0}, 800);
				}
			});
			// ========== Methods ==============
			$scope.find = function () {
				$scope.originalVideos = $scope.tempVideoArr = Videos.query($stateParams);
				$scope.tempVideoArr.$promise.then(function (result) {
					$scope.originalVideos = $scope.tempVideoArr = result.data;
					$scope.bigTotalItems = result.allCount;
					$scope.itemsPerPage = result.data.length <= $scope.itemsPerPage ? $scope.itemsPerPage : '';
					if ($stateParams.category){
						$scope.currentCategory = $stateParams.category;
						$scope.selectedSubCats = [];
						$scope.selectedWords = [];
						$scope.subCats = getFilterInfo(result, 'categories');
						$scope.keywords = getFilterInfo(result, 'keywords');
					}
					$scope.$emit('UNLOAD');
					$timeout( showTooltip, 1000);
				});
				$scope.canCreate = Roles.hasAtLeastRole('editor');

			};
			$scope.open = function (video) {
				$modal.open({
					animation: false,
					keyboard: true,
					template: '<div class="modal-body modal-video embed-responsive"	data-ng-bind-html="videov"><div>',
					controller: 'VideoModalCtrl',
					size: 'md',
					resolve: {
						video: function () {
							return video;
						}
					}
				});
			};
			$scope.resetActiveCat = function () {
				$location.url('/videos');
			};
			$scope.resetFilter = function () {
				$scope.videos = $scope.tempVideoArr;
				$scope.selectedSubCats = [];
				$scope.selectedWords = [];
				$scope.subCats = getFilterInfo($scope.videos, 'categories');
				$scope.keywords = getFilterInfo($scope.videos, 'keywords');

			};
			$scope.deselect = function (item, isWord) {
				/*jshint -W030 */
				isWord ? $scope.selectedWords.splice(_.indexOf($scope.selectedWords, item), 1)
					: $scope.selectedSubCats.splice(_.indexOf($scope.selectedWords, item), 1);
			};
			$scope.filter = function (item, isWord, e) {
				e.preventDefault();
				/*jshint -W030 */
				isWord ? $scope.selectedWords.push(item): $scope.selectedSubCats.push(item);
			};

			$scope.audioFilter = function () {
				if (!$scope.withAudio){
					$scope.tempVideoArr = _.filter($scope.originalVideos, function (video) {
						return /src/.test(video.embed.audio);
					});
				} else {
					$scope.tempVideoArr = $scope.originalVideos;
				}
				$scope.withAudio = !$scope.withAudio;
			};
			$scope.changeItemsPerPage = function () {
				var count = {
						limit: $scope.itemsPerPage
					};
				_.extend($stateParams, count);
				$scope.find();
			};
			function doFilter(paramsArr) {
				if($stateParams.category || _.isArray(paramsArr[0]) || _.isArray(paramsArr[1]) || paramsArr[2]) {
					$scope.videos = categoryFilter.video($scope.tempVideoArr, paramsArr[0] || [], paramsArr[1] || [], paramsArr[2]);
					$scope.subCats = _.difference(getFilterInfo($scope.videos, 'categories'), paramsArr[0]);
					$scope.keywords = _.difference(getFilterInfo($scope.videos, 'keywords'), paramsArr[1]);
				} else {
					$scope.videos = $scope.tempVideoArr;
				}
			}

			function getFilterInfo (videos, mode) {
				var tempArr = [];
				tempArr = _.chain(videos)
					.map(function (video) {
						_.map(video[mode], function (item) {
							tempArr.push(item);
						});
					})
					.thru(function () {
						return _.uniq(tempArr);
					}).thru(function (arr) {
						return _.difference(arr, [$stateParams.category]);
					})
					.value();
				return tempArr;
			}
			function showTooltip () {
				$scope.tooltip = true;
				$timeout(function () {
					$scope.tooltip = false;
				}, 3000);
			}
		}])

	.controller('VideosViewController', ['$scope', '$stateParams', '$location', '$sce', 'Authentication', 'Roles', 'Videos', '$modal', 'PageTitle', 'MetaInformation', 'Categories', 'GetterFromServer',
		function ($scope, $stateParams, $location, $sce, Authentication, Roles, Videos, $modal, PageTitle, MetaInformation, Categories, GetterFromServer) {
			$scope.$emit('LOAD');
			$scope.authentication = Authentication;
			$scope.Roles = Roles;
			function getFeaturedVideo() {
				GetterFromServer.featured('video').then(function (data) {
					$scope.f = data.data;
				});
			}
			getFeaturedVideo();
			$scope.update = function () {
				if ($scope.video.author !== null) {
					$scope.video.author.value = $scope.video.author.value;
					$scope.video.author.label = $scope.video.author.label;
				}
				$scope.embedCode = $sce.trustAsHtml('<iframe width="560" height="315" src="http://www.example.com/view?id=' +
				$scope.video._id + '" frameborder="0" allowfullscreen></iframe>');
				$scope.canEdit = Roles.hasAtLeastRole('reviewer') || Authentication.user && ($scope.video.user === Authentication.user._id || $scope.video.author === Authentication.user._id);
				$scope.embedv = $sce.trustAsHtml($scope.video.embed.video);
				$scope.embeda = $sce.trustAsHtml($scope.video.embed.audio);
				$scope.video.url = $location.absUrl();
				PageTitle.setTitle($scope.video.title.en);
				MetaInformation.setMetaDescription($scope.video.description.en);
				$scope.$emit('UNLOAD');
			};

			$scope.findOne = function () {
				$scope.video = Videos.get({ videoId: $stateParams.videoId });
				$scope.video.$promise.then($scope.update);
			};
			$scope.openv = function (video) {
				$modal.open({
					animation: false,
					keyboard: true,
					template: '<div class="modal-body modal-video embed-responsive"	data-ng-bind-html="videov"><div>',
					controller: 'VideoModalCtrl',
					size: 'md',
					resolve: {
						video: function () {
							return video;
						}
					}
				});
			};
			$scope.updateProp = function (property, data) {
				var video = $scope.video;
				if (property === 'en' || property === 'ur'){
					video.title[property] = data;
				}					

				video[property] = data;
				return video.$update();
			};

			$scope.remove = function () {
				if (!$scope.video) return;

				$scope.video.$remove(function () {
					$location.path('videos');
				});
			};

			$scope.close = function () {
				$scope.video.status = 'closed';
				return $scope.video.$update();
			};

			$scope.featured = function () {
				$scope.video.featured = true;
				return $scope.video.$update(function () {
					getFeaturedVideo();
				});
			};

			$scope.open = function () {
				$scope.video.status = 'open';
				return $scope.video.$update();
			};

			Categories.top(function (data) {
				$scope.categories = data;
			}, function (err) {
				console.err(err);
			});

			$scope.checkAudio = function () {
				return /src/.test($scope.embeda);
			};
		}])
	.controller('VideosCreateController', ['$scope', '$location', '$q', 'Authentication', 'VideoFormSchema', 'Videos', 'PageTitle', 'MetaInformation',
		function ($scope, $location, $q, Authentication, VideoFormSchema, Videos, PageTitle, MetaInformation) {
			$scope.authentication = Authentication;
			$scope.videoFormSchema = VideoFormSchema;
			$scope.video = {};

			PageTitle.setTitle('Create new video');
			MetaInformation.setMetaDescription('Create new video');

			$scope.create = function (form) {
				var video = new Videos($scope.video);

				$scope.$broadcast('schemaFormValidate');
				if (!form.$valid) return;

				video.$save(function (response) {
					$location.path('videos/' + response._id);
				}, function (errorResponse) {
					$scope.error = errorResponse.data.message;
				});
			};
		}])
	.controller('VideosEditController', ['$scope', '$location', 'Authentication', 'VideoFormSchema', 'video', 'PageTitle', 'MetaInformation',
		function ($scope, $location, Authentication, VideoFormSchema, video, PageTitle, MetaInformation) {
			$scope.authentication = Authentication;
			$scope.video = video;
			$scope.videoFormSchema = VideoFormSchema;
			/*jshint ignore:start*/
			if (video.author != null) {
				$scope.videoFormSchema.schema.properties.author.items = [video.author];
				$scope.video.author = video.author.value;
			}
			/*jshint ignore:end*/

			PageTitle.setTitle('Edit video');
			MetaInformation.setMetaDescription('Edit video');

			// Update existing Video
			$scope.update = function (form) {
				var video = $scope.video;

				$scope.$broadcast('schemaFormValidate');
				if (!form.$valid) return;

				video.$update(function () {
					$location.path('videos/' + video._id);
				}, function (errorResponse) {
					$scope.error = errorResponse.data.message;
				});
			};
		}])
;
