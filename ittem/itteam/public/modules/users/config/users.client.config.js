'use strict';

// Config HTTP Error Handling
angular.module('users', ['permission'])

	.config(['$httpProvider',
		function($httpProvider) {
			$httpProvider.interceptors.push(['$q', '$location', 'Authentication',
				function($q, $location, Authentication) {
					return {
						request: function (cfg) {
							if (!Authentication.user) {
								cfg.headers.authorization = window.read_key;
							}
							return cfg;
						},
						responseError: function(rejection) {
							switch (rejection.status) {
								case 401:
									// Deauthenticate the global user
									Authentication.user = null;

									// Redirect to signin page
									$location.path('signin');
									break;
								case 403:
									// Add unauthorized behaviour 
									break;
							}

							return $q.reject(rejection);
						}
					};
				}
			]);
		}])

	.run(['Permission', 'Roles', '_',
        function (Permission, Roles, _) {
            _.forEach(Roles.roles, function (roleName) {
                Permission.defineRole(roleName, function () {
                    return Roles.hasAtLeastRole(roleName);
                });
            });
        }])

    .run(['Menus',
        function (Menus) {
            Menus.addMenuItem('topbar', 'Users', 'users', 'dropdown', null, false, ['admin']);
            Menus.addSubMenuItem('topbar', 'users', 'List users', 'users');
        }])
	;
