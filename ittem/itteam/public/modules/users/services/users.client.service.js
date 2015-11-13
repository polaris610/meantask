'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users')

	.factory('Users', ['$resource',
		function($resource) {
			return $resource('api/users/:userId', { userId: '@_id' }, {
				update: {
					method: 'PUT'
				},
                query: {
                    method: 'GET',
                    isArray: true,
                    responseType: 'json'
                }
			});
		}
	])

    .factory('userAutocomplete', ['$http',
        function ($http) {
            return function (search) {
                return $http.get('/api/users', {
                    params: {
                        ac: true,
                        role: 'author',
                        q: search
                    }
                });
            };
        }
    ])

	.factory('UserFormSchema', function () {
		return {
			schema: {
				type: 'object',
				properties: {
					firstName: { type: 'string', title: 'First name' },
					lastName: { type: 'string', title: 'Last name' },
					email: { type: 'string', title: 'Email' },
					username: { type: 'string', title: 'Username' }
				}
			},
			form: [
				'firstName',
				'lastName',
				'email',
				{
					type: 'submit',
					title: 'Save'
				}
			]
		};
	})

    .factory('UserEditFormSchema', ['Roles',
        function (Roles) {
            return {
                schema: {
                    type: 'object',
                    properties: {
                        firstName: {
                            type: 'string',
                            title: 'First name'
                        },
                        lastName: {
                            type: 'string',
                            title: 'Last name'
                        },
                        email: {
                            type: 'string',
                            title: 'Email'
                        },
                        roles: {
                            type: 'array',
                            title: 'Roles',
                            items: {type: 'string', enum: Roles.roles}
                        }
                    }
                },
                form: [
                    'firstName',
                    'lastName',
                    'email',
                    'roles',
                    {
                        type: 'submit',
                        title: 'Save'
                    }
                ]
            };
        }])

    .factory('Roles', ['_', 'Authentication',
        function (_, Authentication) {
            var isSuperRole,
                hasAtLeastRole,
                hierarchy = {
                    'public': null,
                    'author': 'public',
                    'editor': 'author',
                    'reviewer': 'editor',
                    'admin': 'reviewer'
                };

            isSuperRole = function (ofRole, role) {
                if (role === ofRole) return true;
                else if (hierarchy[role] === null) return false;
                else return isSuperRole(ofRole, hierarchy[role]);
            };

            hasAtLeastRole = function (usr, role) {
                if (_.isString(usr)) {
                    role = usr;
                    usr = Authentication.user;
                }

                return _.some(usr.roles, _.partial(isSuperRole, role));
            };

            return {
                hasAtLeastRole: hasAtLeastRole,
                roles: _.keys(hierarchy)
            };
        }])
    ;
