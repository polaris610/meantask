'use strict';

angular.module('core')
    .directive('affix', function () {
        return {
            restrict: 'A',
            link: function (scope, element) {
                angular.element(element).affix({
                    offset: {
                        top: 20
                    }
                });
            }
        };
    });
