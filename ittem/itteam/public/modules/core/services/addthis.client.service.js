'use strict';

angular.module('core')
    // Provide addthis so linter doesn't complain.
    .factory('$addthis', ['$window',
        function ($window) {
            return $window.addthis;
        }]);
