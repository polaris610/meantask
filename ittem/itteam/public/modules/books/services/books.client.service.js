'use strict';

// Books service used to communicate Books REST endpoints
angular.module('books')

	.factory('Books', ['$resource',
		function($resource) {
			return $resource('api/books/:bookId', {
				bookId: '@_id',
				chapterNo:'@chapterNo',
				subChapterNo: '@subChapterNo',
				info: '@info'
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
	.factory('Authors', ['$http', function ($http) {
		return {
			query: function () {
				return $http.get('/api/authors')
					.success(function (authors) {
						return authors;
					})
					.error(function (err) {
						return err;
					});
			}
		};
	}])
	.factory('chapterSanitizer', ['_', function (_) {
		function sanitizeChapters (chapters) {
			var chptrs = _.filter(chapters, function (ch) {
				if (!ch || !('title' in ch) || _.trim(ch.title.en) === '' && _.trim(ch.content.en) === '') return false;
				else return true;
			});

			chptrs = _.map(chptrs, function (ch) {
				if (!('subchapters' in ch) || !_.isArray(ch.subchapters) || ch.subchapters.length === 0) return ch;
				else {
					ch.subchapters = sanitizeChapters(ch.subchapters);
					return ch;
				}
			});

			return chptrs;
		}

		return function (chapters) {
			return sanitizeChapters(chapters);
		};
	}])

	.factory('BookFormSchema',
	['$http', 'userAutocomplete', function ($http, userAutocomplete) {
		return {
			schema: {
				type: 'object',
				properties: {
					featured: {
						type: 'boolean',
						title: 'Is featured?'
					},
                    booklanguage: {
                        type: 'array',
                        title: 'Languages available for this Book',
                        items: {type: 'string', enum: ['English', 'Urdu']},
                        validationMessage: 'Please select at least one Language',
                        required: true
                    },					
					title: {
						type: 'object',
						title: 'Title',
						properties: {
							en: {type: 'string', title: 'English', minLength: 3, validationMessage: 'Please enter title.' },
							ur: {type: 'string', title: 'Urdu' }
						},
						required: 'en'
					},
					description: {
						type: 'object',
						title: 'Description',
						properties: {
							en: {type: 'string', title: 'English', minLength: 3, validationMessage: 'Please enter title.' },
							ur: {type: 'string', title: 'Urdu' }
						},
						required: 'en'
					},
					thumbnail: {
						type: 'string',
						title: 'Thumbnail'
					},
					 content: {
						type: 'object',
						title: 'Chapter',
						properties: {
							title: {
								type: 'object',
								title: 'Title',
								properties: {
									en: {
										type: 'string',
										title: 'English title',
										minLength: 3,
										validationMessage: 'Please enter title.'
									},
									ur: {type: 'string', title: 'Urdu title'}
								},
								required: 'en'
							},
							content: {
								type: 'object',
								title: 'Content',
								properties: {
									en: {
										type: 'string',
										title: 'English content',
										minLength: 3,
										validationMessage: 'Please enter content.'
									},
									ur: {type: 'string', title: 'Urdu content'}
								},
								required: 'en'
							}
						}
					},
					//subchapter: {
					//	type: 'object',
					//	title: 'Subchapter',
					//	properties: {
					//		title: {
					//			type: 'object',
					//			title: 'Title',
					//			properties: {
					//				en: {type: 'string', title: 'English title', minLength: 3, validationMessage: 'Please enter title.' },
					//				ur: {type: 'string', title: 'Urdu title' }
					//			}
					//		},
					//		content: {
					//			type: 'object',
					//			title: 'Content',
					//			properties: {
					//				en: {type: 'string', title: 'English content', minLength: 3, validationMessage: 'Please enter content.' },
					//				ur: {type: 'string', title: 'Urdu content' }
					//			}
					//		}
					//	}
					//},
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
				'featured',
				'booklanguage',
				'title',
				{
					key: 'description',
					itemss: [
						{ key:'description.en', title:'English description', type: 'textarea' },
						{ key:'description.ur', title:'Urdu description', type: 'textarea' }
					]
				},
				{
					key: 'thumbnail',
					type: 'upload'
				},
				{
					key: 'content',
					title: 'Chapter',
					items: [
						'content.title.en',
						'content.title.ur',
						{ key: 'content.content.en', type: 'textarea'},
						{ key: 'content.content.ur', type: 'textarea'}
						],
					condition: '!subChapterNo'
				},
				{
					key: 'content',
					title: 'Subchapter',
					items: [
						'content.title.en',
						'content.title.ur',
						{ key: 'content.content.en', type: 'textarea'},
						{ key: 'content.content.ur', type: 'textarea'}
					],
					condition: 'subChapterNo'
				},
				{
					key: 'author',
					placeholder: 'You may enable the original author to edit this book',
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
