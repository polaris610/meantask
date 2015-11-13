'use strict';

angular.module('users')
    .controller('SignupController', ['$scope', '$http', '$location', 'Authentication', '$stateParams', '$state',
        function($scope, $http, $location, Authentication, $stateParams, $state) {
            $scope.twitter = {};
            $scope.authentication = Authentication;
            // If user is signed in then redirect back home
            if ($scope.authentication.user) $location.path('/');
            if ($stateParams.user) $scope.twitter.username = $stateParams.user;
            $scope.signup = function () {
                $http.post('/api/auth/signup', $scope.credentials).success(function (response) {
                    // If successful we assign the response to the global user model
                    $scope.authentication.user = response;

                    // And redirect to the index page
                    $location.path('/');
                }).error(function (response) {
                    $scope.error = response.message;
                });
            };
            $scope.confirmTwitter = function () {
                if (!$scope.twitter.email) return false;
                var confirmData = {
                    username: $scope.twitter.username,
                    email: $scope.twitter.email
                };
                $http.post('/auth/twitter/confirm', confirmData).success(function (response) {
                    // If successful we assign the response to the global user model
                    $scope.authentication.user = response;

                    // And redirect to the index page
                    $state.go('videosHome');
                }).error(function (response) {
                    $scope.error = response.message;
                });
            };
        }
    ]);
