'use strict';

angular.module('upload', [])

	.config(['schemaFormDecoratorsProvider', function(decoratorsProvider){
		decoratorsProvider.addMapping('bootstrapDecorator', 'upload', 'modules/upload/views/index.html');
	}])

	.directive('fileUpload', ['Upload', '$window', 'sfSelect', 'schemaForm', 'sfValidator', '_', '$location', function(Upload, $window, sfSelect, schemaForm, sfValidator, _, $location){
		return {
			template: '' +
			'<div ng-hide="data" class="form-control">' +
			'<input ng-disabled="form.readonly" ng-hide="inProgress > 0" type="file" ngf-select ngf-change="upload($files)">' +
			'<div ng-show="inProgress" class="progress">' +
			'<div class="progress-bar progress-bar-striped active" role="progressbar" style="width: 100%"></div>' +
			'</div>' +
			'</div>' +
			'<div ng-show="data">' +
			'<div class="btn btn-default" ng-click="download()">Download</div>' +
			'<div ng-disabled="form.readonly" class="btn btn-danger" ng-click="remove()"><i class="glyphicon glyphicon-trash"></i> Remove File</div>' +
			'</div>',
			restrict: 'A',
			scope: false,
			require: 'ngModel',
			link: function(scope, element, attrs, ngModel) {
				scope.inProgress = false;
				scope.data = sfSelect(scope.form.key, scope.model);

				scope.upload = function($files) {
					if (!$files || _.isArray($files) && $files.length === 0) return;
					scope.inProgress = true;
					Upload.upload({
						url: 'api/upload',
						method: 'POST',
						fields: {'location': $location.path()},
						data: {},
						file: $files
					})
					.success(function(data, status, headers, config) {
						scope.inProgress = false;
						scope.data = data.path;
						ngModel.$setViewValue(data.path);
					})
					.error(function(err){
						scope.inProgress = false;
						alert('There was an issue uploading your file. Please try again.');
					});
				};

				scope.remove = function(){
					ngModel.$setViewValue(undefined);
					scope.data = undefined;
				};

				scope.download = function(){
					var d = window.document.getElementById('downloads');
					if(d)
						d.src = 'm/thumb/video/' + scope.data;
					else
						$window.open('m/thumb/video/' + scope.data);
				};

				var error;

				scope.validateArray = function() {
					var result = sfValidator.validate(scope.form, scope.data);
					if (result.valid === false &&
						result.error &&
						(result.error.dataPath === '' || result.error.dataPath === '/' + scope.form.key[scope.form.key.length - 1])
					) {

						// Set viewValue to trigger $dirty on field. If someone knows a
						// a better way to do it please tell.
						ngModel.$setViewValue(scope.data);
						error = result.error;
						ngModel.$setValidity('schema', false);

					} else {
						ngModel.$setValidity('schema', true);
					}
				};

				scope.$on('schemaFormValidate', scope.validateArray);

				scope.hasSuccess = function() {
					return ngModel.$valid && !ngModel.$pristine;
				};

				scope.hasError = function() {
					return ngModel.$invalid;
				};

				scope.schemaError = function() {
					return error;
				};

			}
		};
	}]);
