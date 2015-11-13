'use strict';

//Videos service used to communicate Videos REST endpoints
angular.module('videos')

	.factory('Videos', ['$resource',
		function($resource) {
			return $resource('api/videos/:videoId', {
				videoId: '@_id'
			}, {
				update: {
					method: 'PUT'
				},
				query: {
					method: 'GET',
					isArray: false,
					responseType: 'json'
				}
			});
		}])

	.factory('Categories', ['$http', '_', 
		function ($http, _) {
			var transform = function (data) {
				return _.map(data, function (cat) {
					return {
						text: cat._id,
						weight: cat.count,
						link: '#!/videos?category='+ _.trim(cat._id)
					};
				});	
			};
			
			return {
				top: function (done, err) {
					$http.get('/api/videos/categories')
						.success(function (data) {
							done(transform(data));
						})
						.error(err);
				}
			};
		}])

	.factory('VideoFormSchema',
		['$http', 'userAutocomplete', function ($http, userAutocomplete) {
			return {
				schema: {
					type: 'object',
					properties: {
						featured: {
							type: 'boolean',
							title: 'Is featured?'
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
						categories: { 
							type: 'array', 
							title: 'Categories', 
							items: { type: 'string', title: 'Category' } 
						},
						status: { 
							type: 'string', 
							title: 'Status',
							enum: ['draft', 'open', 'closed'] 
						},
                        keywords: { 
							type: 'array', 
							title: 'Keywords', 
							items: { type: 'string', title: 'Keyword' } 
						},
                        video_language: { 
							type: 'string', 
							title: 'Video Language',
							enum: ['English', 'Urdu']  
                        },
                        seq: { type: 'integer', title: 'Sequence Number:' },
                        embed: { 
							type: 'object', 
							title: 'Embed Code', 
							properties: {
								video: {type: 'string', title: 'Video' },
								thumb: {type: 'string', title: 'Thumb' },
								audio: {type: 'string', title: 'Audio' }
							}
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
					'title',
					{
						key: 'description',
						items: [
								{ key:'description.en', title:'English', type: 'textarea' },
								{ key:'description.ur', title:'Urdu', type: 'textarea' }
						]
					},
					'keywords',
					{
						key: 'video_language',
						type: 'select',
						titleMap: [
							{ value: 'English', name: 'English' },
							{ value: 'Urdu', name: 'Urdu' }
						]
					},
					'seq',
					{
						key: 'embed',
						items: [
								{ key: 'embed.video', title:'Video', type: 'textarea' },
								{ key: 'embed.audio', title:'Audio', type: 'textarea' },
								{ key: 'embed.thumb', title: 'Thumbnail', type: 'upload' }
						]
					},
					{
						key: 'author',
						placeholder: 'You may enable the original author to edit this video',
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
					'categories',
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
	.factory('categoryFilter', ['_', function(_){
		return {
			video: function (videos, categories, keywords, author) {
				var params = {
					categories:categories,
					keywords: keywords,
					author: {
						_id: author
					}
				};
				if(!params.categories.length) delete params.categories;
				if(!params.keywords.length) delete params.keywords;
				if(!author) delete params.author;
				return _.filter(videos, params);
			}
		};
	}])
    ;
