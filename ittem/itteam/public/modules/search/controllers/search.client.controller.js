'use strict';

angular.module('search')

	.controller('SearchController', ['$scope', '$window', '$stateParams', '$location', 'searchResource', '_', 'PageTitle', 'MetaInformation',
		function($scope, $window, $stateParams, $location, searchResource, _, PageTitle, MetaInformation) {
			PageTitle.setTitle('Search');
			MetaInformation.setMetaDescription('Search');

			// Init
			$scope.searchFilter = {
				category: [],
				book: [],
				blog: []
			};
			$scope.mobile = $window.outerWidth <= 760;
			$scope.filter = {};
			$scope.$watch(function () {
				return $location.search();
			}, function (n) {
				$scope.find();
			});
			//Methods
			$scope.find = function (options) {
				$scope.$emit('LOAD');
				if(options) {
					_.extend($stateParams, options);
					$location.search($stateParams);
				} else {
					_.extend($stateParams, $location.search());
				}
				searchResource($stateParams).then(
					function (data) {
						$scope.src = {};

						_.each(data.data, function (item) {
							if (!$scope.src[item._type]) $scope.src[item._type] = [];
							$scope.src[item._type].push(item);
						});
						$scope.categoriesCount = _.countBy(_.flatten(_.pluck($scope.src.video, 'categories')));
						if ($location.search().category) {
							$scope.categoriesCount = $location.search().category.length ? _.pick($scope.categoriesCount, $location.search().category):$scope.categoriesCount;
						}
						$scope.categoriesCount = _.object(_.take(_.pairs($scope.categoriesCount), 7));
						$scope.categories = _.keys($scope.categoriesCount);
						$scope.bookCount = _.countBy($scope.src.book, function (n) {
							return n.author.displayName;
						});
						$scope.bookAuthors = _.uniq(_.pluck($scope.src.book, 'author'), function (item) {
							return item.displayName;
						});
						$scope.blogCount = _.countBy($scope.src.post, function (n) {
							return n.author.displayName;
						});
						$scope.blogAuthors = _.uniq(_.pluck($scope.src.post, 'author'), function (item) {
							return item.displayName;
						});

						$scope.docs = data.data;
						$scope.$emit('UNLOAD');
					},
					function (err) {
						console.error(err);
						$scope.$emit('UNLOAD');
					}
				);
			};

			$scope.filterHandler = function (filter, property, key, value) {
				if (!value){
					$scope.searchFilter[filter] = _.without($scope.searchFilter[filter], key);
				} else {
					$scope.searchFilter[filter].push(key);
				}
				$location.search(_.extend($location.search(), $scope.searchFilter));
				$scope.find($scope.searchFilter);
			};

			$scope.resetFilter = function (filter) {
				$scope.searchFilter[filter] = [];
				switch (filter){
					case 'category': _.each($scope.categories, function (cat) {
							$scope.filter.video[cat] = false;
						});
						break;
					case 'book': _.each($scope.bookAuthors, function (a) {
							$scope.filter.book[a._id] = false;
						});
						break;
					case 'blog': _.each($scope.blogAuthors, function (a) {
							$scope.filter.blog[a._id] = false;
						});
						break;
				}
				$location.search(_.extend($location.search(), $scope.searchFilter));
				$scope.find($scope.searchFilter);
			};

			$scope.showCross = function (cat) {
				return _.any($scope.filter[cat], function (item) {
					return item;
				});
			};

		}
	])
;
