'use strict';

angular.module('users').controller('SinginController', ['$scope', '$http', '$location', 'Authentication', '$modalInstance',
	function($scope, $http, $location, Authentication, $modalInstance) {
		$scope.authentication = Authentication;

		// If user is signed in then redirect back home
		if ($scope.authentication.user) $location.path('/');

		$scope.signin = function() {
			$http.post('/api/auth/signin', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;
				$modalInstance.close();
				// And redirect to the index page
				$location.path('/');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
		$scope.cancel = function () {
			$modalInstance.dismiss('cancel');
		};
	}
]);
