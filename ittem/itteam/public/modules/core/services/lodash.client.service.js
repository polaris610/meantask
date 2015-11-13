'use strict';

angular.module('core')
	// Provide lodash so linter doesn't complain.
	.factory('_', ['$window', 
		function ($window) {
			return $window._;
		}]);