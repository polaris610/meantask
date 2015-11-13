'use strict';

angular.module('core')
    .controller('LoadingController', ['$scope', '$window', '$location', 'MetaInformation', 'PageTitle',
        function ($scope, $window, $location, MetaInformation, PageTitle) {
            $scope.PageTitle = PageTitle;
            $scope.MetaInformation = MetaInformation;
            $scope.$on('LOAD',function(){$scope.loading=true;});
            $scope.$on('UNLOAD',function(){$scope.loading=false;});
            $scope.$on('$stateChangeSuccess', function() {
                $scope.currentLocation = $location.path();
                //todo: make function to detect document.height < window.height
                $scope.stick = $scope.currentLocation === '/search' ||
                    $scope.currentLocation === '/signup' ||
                    $scope.currentLocation === '/password/forgot' ||
                    $scope.currentLocation === '/books'
                ;
            });
            $scope.mobile = $window.outerWidth <= 760;
            $scope.goTop = function (e) {
                e.preventDefault();
                angular.element('html, body').animate({scrollTop: 0}, 800);
            };
        }

    ]);
