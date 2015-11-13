'use strict';

angular.module('core')
    .directive('replaceComponent', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                if(window.outerWidth <= 760){
                    angular.element(attrs.target).append(element);
                }
            }
        };
    });
