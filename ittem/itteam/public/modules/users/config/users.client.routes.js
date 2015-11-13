'use strict';

// Setting up route
angular.module('users').config(['$stateProvider',
	function($stateProvider) {
		// Users state routing
		$stateProvider.
		state('profile', {
			url: '/settings/profile',
			templateUrl: 'modules/users/views/settings/edit-profile.client.view.html'
		}).
		state('password', {
			url: '/settings/password',
			templateUrl: 'modules/users/views/settings/change-password.client.view.html'
		}).
		state('confirm', {
			url: '/newTwitterUser?user',
			templateUrl: 'modules/users/views/authentication/twitter-email.client.view.html'
		}).
		state('accounts', {
			url: '/settings/accounts',
			templateUrl: 'modules/users/views/settings/social-accounts.client.view.html'
		}).
		state('signup', {
			url: '/signup',
			templateUrl: 'modules/users/views/authentication/signup.client.view.html'
		}).
		state('forgot', {
			url: '/password/forgot',
			templateUrl: 'modules/users/views/password/forgot-password.client.view.html'
		}).
		state('reset-invalid', {
			url: '/password/reset/invalid',
			templateUrl: 'modules/users/views/password/reset-password-invalid.client.view.html'
		}).
		state('reset-success', {
			url: '/password/reset/success',
			templateUrl: 'modules/users/views/password/reset-password-success.client.view.html'
		}).
		state('reset', {
			url: '/password/reset/:token',
			templateUrl: 'modules/users/views/password/reset-password.client.view.html'
		})
        .state('list', {
            url: '/users',
            templateUrl: 'modules/users/views/list.client.view.html',
            controller: 'UsersListController',
            data: {
                permissions: {
                    only: ['admin'],
                    redirectTo: 'signin'
                }
            }
        })
        .state('editUser', {
            url: '/users/:userId/edit',
            controller: 'UsersEditController',
            templateUrl: 'modules/users/views/edit-user.client.view.html',
            data: {
                permissions: {
                    only: ['admin'],
                    redirectTo: 'signin'
                }
            },
            resolve: {
                user: ['$stateParams', '$q', 'Users',
                    function ($stateParams, $q, Users) {
                        var deferred = $q.defer();
                        Users.get({userId: $stateParams.userId}, function (u) {
                            deferred.resolve(u);
                        });
                        return deferred.promise;
                    }]
            }
        });
	}
]);
