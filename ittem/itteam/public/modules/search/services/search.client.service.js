'use strict';

angular.module('search')

	.factory('searchResource', ['$http', function ($http) {
		return function (params) {
			return $http.get('/api/search', {params: params});
		};
	}])

	.filter('cut', function () {
		return function (value, wordwise, max, tail) {
			if (!value) return '';

			max = parseInt(max, 10);
			if (!max) return value;
			if (value.length <= max) return value;

			value = value.substr(0, max);
			if (wordwise) {
				var lastspace = value.lastIndexOf(' ');
				if (lastspace !== -1) {
					value = value.substr(0, lastspace);
				}
			}

			return value + (tail || ' …');
		};
	})
;
