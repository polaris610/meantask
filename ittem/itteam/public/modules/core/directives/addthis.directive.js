'use strict';

angular.module('core')
    .directive('addthisToolbox', ['$timeout', '$addthis', function($timeout, $addthis) {
        return {
            restrict : 'A',
            transclude : true,
            replace : true,
            template : '<div ng-transclude></div>',
            link : function($scope, element, attrs) {
                $timeout(function () {
                    $addthis.init();
                    $addthis.toolbox(angular.element(element).get(), {}, {
                        title: attrs.title,
                        url: attrs.url
                    });
                }, 2000);
            }
        };
    }]);
