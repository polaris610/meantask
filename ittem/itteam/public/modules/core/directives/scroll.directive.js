'use strict';

angular.module('core')
    .directive('scroll', function ($window) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                var htmlElement = document.documentElement,
                    e = false,
                    $topHeader = angular.element('.top-header'),
                    topHeaderHeight = $topHeader.innerHeight();
                scope.shrinkHeader = false;
                angular.element($window).bind('scroll', function() {
                    if (!e) {
                        e = true;
                        setTimeout(makeShrink, 50);
                    }
                });

                function makeShrink() {
                    var offset = getOffset();
                    if (offset >= 35) {
                        element.addClass('mainHeaderShrink');
                        $topHeader.addClass('hide');
                    }
                    else {
                        element.removeClass('mainHeaderShrink');
                        $topHeader.removeClass('hide');
                    }
                    e = false;
                }

                function getOffset() {
                    return window.pageYOffset || htmlElement.scrollTop;
                }
            }
        };
});
