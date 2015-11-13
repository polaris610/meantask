'use strict';

angular.module('users')
    
    .controller('UsersListController', ['$scope', 'Users',
        function ($scope, Users) {
            $scope.find = function () {
                $scope.users = Users.query();
            };
            // Check provider for labels class
            $scope.checkProvider = function (user) {
                var spanClass = '';
                switch (user.provider) {
                    case 'twitter': spanClass = 'info'; break;
                    case 'facebook': spanClass = 'primary'; break;
                    case 'google': spanClass = 'success'; break;
                    default : spanClass = 'default'; break;
                }
                return spanClass;
            };
        }])

    .controller('UsersEditController', ['$scope', '$location', 'user', 'Users', 'UserEditFormSchema',
        function ($scope, $location, user, Users, UserEditFormSchema) {
            $scope.user = user;
            $scope.userFormSchema = UserEditFormSchema;

            $scope.update = function (form) {
                var user = new Users($scope.user);

                $scope.$broadcast('schemaFormValidate');
                if (!form.$valid) return;

                user.$update(function () {
                    $location.path('/users');
                }, function (errorResponse) {
                    $scope.error = errorResponse.data.message;
                });
            };
        }])
    ;
