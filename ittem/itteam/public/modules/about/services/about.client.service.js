'use strict';

// About service used to communicate About REST endpoints
angular.module('about')

	.factory('About', ['$resource',
		function($resource) {
			return $resource('api/about/:aboutId', { aboutId: '@_id'
			}, {
				update: {
					method: 'PUT'
				},
				query: {
					method: 'GET',
					isArray: true,
					responseType: 'json'
				}
			});
		}])

	.factory('AboutFormSchema',
	['$http', 'userAutocomplete', function ($http, userAutocomplete) {
		return {
			schema: {
				type: 'object',
				properties: {
					title: {
						type: 'object',
						title: 'Title',
						properties: {
							en: {type: 'string', title: 'English', minLength: 3, validationMessage: 'Please enter title.' },
							ur: {type: 'string', title: 'Urdu' }
						},
						required: 'en'
					},
					body: {
						type: 'object',
						title: 'About content',
						properties: {
							en: {type: 'string', title: 'English', minLength: 3, validationMessage: 'Please enter title.' },
							ur: {type: 'string', title: 'Urdu' }
						},
						required: 'en'
					},
					about_language: {
						type: 'string',
						title: 'about language',
						enum: ['en', 'ur']
					},
					status: {
						type: 'string',
						title: 'Status',
						enum: ['draft', 'open', 'closed']
					},
					author: {
						type: 'string',
						title: 'Author',
						format: 'uiselect',
						items: [],
						required: true,
						validationMessage: 'Author should be set.'
					}
				}
			},
			form: [
				'title',
				{
					key: 'body',
					items: [
						{ key:'body.en', title:'English content', type: 'textarea' },
						{ key:'body.ur', title:'Urdu content', type: 'textarea' }
					]
				},
				{
					key: 'about_language',
					type: 'select',
					titleMap: [
						{ value: 'en', name: 'English' },
						{ value: 'ur', name: 'Urdu' }
					]
				},
				{
					key: 'author',
					placeholder: 'You may enable the original author to edit this about',
					options: {
						uiClass: 'short_select',
						async: {
							refreshDelay: 100,
							call: function (schema, options, search) {
								return userAutocomplete(search);
							}
						}
					}
				},
				{
					key: 'status',
					type: 'select',
					titleMap: [
						{ value: 'draft', name: 'Draft' },
						{ value: 'open', name: 'Open' },
						{ value: 'closed', name: 'Closed' }
					]
				},
				{
					type: 'submit',
					title: 'Save'
				}
			]
		};
	}])
;
