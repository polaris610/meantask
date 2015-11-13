'use strict';

// about controller
angular.module('about')

	.controller('AboutListController', ['$scope', '$stateParams', 'Authentication', 'About', 'Roles','PageTitle', 'MetaInformation', 'GetterFromServer',
		function ($scope, $stateParams, Authentication, About, Roles, PageTitle, MetaInformation, GetterFromServer) {
			$scope.authentication = Authentication;
			$scope.Roles = Roles;
			$scope.lang = 'en';

			PageTitle.setTitle('About');
			MetaInformation.setMetaDescription('About');
			GetterFromServer.about().then(function (data) {
				$scope.about1 = data.data;
			});
			$scope.find = function () {
				$scope.abouts = About.query($stateParams);
				$scope.canCreate = Roles.hasAtLeastRole('editor');
			};
			$scope.changeLang = function () {
				$scope.lang = $scope.lang === 'en'? 'ur': 'en';
			};
		}])

	.controller('AboutViewController', ['$scope', '$stateParams', '$location', '$sce', 'Authentication', 'Roles', 'About',
		function ($scope, $stateParams, $location, $sce, Authentication, Roles, About) {
			$scope.authentication = Authentication;
			$scope.Roles = Roles;

			$scope.update = function () {
				/*jshint ignore:start*/
				if ($scope.about.author != null) {
					$scope.about.author = $scope.about.author.value;
				}
				/*jshint ignore:end*/

				$scope.canEdit = Roles.hasAtLeastRole('reviewer') || (
					Authentication.user && (
						$scope.about.user === Authentication.user._id ||
						($scope.about.author && $scope.about.author === Authentication.user._id)
					)
				);

				$scope.body = {
					en: $sce.trustAsHtml($scope.about.body.en),
					ur: $sce.trustAsHtml($scope.about.body.ur)
				};
			};

			$scope.findOne = function () {
				$scope.about = About.get({ aboutId: $stateParams.aboutId });
				$scope.about.$promise.then($scope.update);
			};

			$scope.remove = function () {
				if (!$scope.about) return;

				$scope.about.$remove(function () {
					$location.path('about');
				});
			};

			$scope.close = function () {
				$scope.about.status = 'closed';
				return $scope.about.$update();
			};

			$scope.open = function () {
				$scope.about.status = 'open';
				return $scope.about.$update();
			};
		}])

	.controller('AboutCreateController', ['$scope', '$location', 'Authentication', 'AboutFormSchema', 'About',
		function ($scope, $location, Authentication, AboutFormSchema, About) {
			$scope.authentication = Authentication;
			$scope.aboutFormSchema = AboutFormSchema;
			$scope.about = {};

			$scope.create = function (form) {
				var about = new About($scope.about);

				$scope.$broadcast('schemaFormValidate');
				if (!form.$valid) return;

				about.$save(function (response) {
					$location.path('about/' + response._id);
				}, function (errorResponse) {
					$scope.error = errorResponse.data.message;
				});
			};
		}])

	.controller('AboutEditController', ['$scope', '$location', 'Authentication', 'AboutFormSchema', 'about',
		function ($scope, $location, Authentication, AboutFormSchema, about) {
			$scope.authentication = Authentication;
			$scope.about = about;
			$scope.aboutFormSchema = AboutFormSchema;
			/*jshint ignore:start*/
			if (about.author != null) {
				$scope.aboutFormSchema.schema.properties.author.items = [about.author];
				$scope.about.author = about.author.value;
			}
			/*jshint ignore:end*/

			// Update existing About
			$scope.update = function (form) {
				var about = $scope.about;

				$scope.$broadcast('schemaFormValidate');
				if (!form.$valid) return;

				about.$update(function () {
					$location.path('about/' + about._id);
				}, function (errorResponse) {
					$scope.error = errorResponse.data.message;
				});
			};
		}])
;
