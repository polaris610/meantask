'use strict';

(function() {
	// Videos Controller Spec
	describe('Videos Controller Tests', function() {
		// Initialize global variables
		var VideosController,
		scope,
		$httpBackend,
		$stateParams,
		$location;

		// The $resource service augments the response object with methods for updating and deleting the resource.
		// If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
		// the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
		// When the toEqualData matcher compares two objects, it takes only object properties into
		// account and ignores methods.
		beforeEach(function() {
			jasmine.addMatchers({
				toEqualData: function(util, customEqualityTesters) {
					return {
						compare: function(actual, expected) {
							return {
								pass: angular.equals(actual, expected)
							};
						}
					};
				}
			});
		});

		// Then we can start by loading the main application module
		beforeEach(module(ApplicationConfiguration.applicationModuleName));

		// The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
		// This allows us to inject a service but then attach it to a variable
		// with the same name as the service.
		beforeEach(inject(function($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_) {
			// Set a new global scope
			scope = $rootScope.$new();

			// Point global variables to injected services
			$stateParams = _$stateParams_;
			$httpBackend = _$httpBackend_;
			$location = _$location_;

			// Initialize the Videos controller.
			VideosController = $controller('VideosController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Video object fetched from XHR', inject(function(Videos) {
			// Create sample Video using the Videos service
			var sampleVideo = new Videos({
				name: 'New Video'
			});

			// Create a sample Videos array that includes the new Video
			var sampleVideos = [sampleVideo];

			// Set GET response
			$httpBackend.expectGET('videos').respond(sampleVideos);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.videos).toEqualData(sampleVideos);
		}));

		it('$scope.findOne() should create an array with one Video object fetched from XHR using a videoId URL parameter', inject(function(Videos) {
			// Define a sample Video object
			var sampleVideo = new Videos({
				name: 'New Video'
			});

			// Set the URL parameter
			$stateParams.videoId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/videos\/([0-9a-fA-F]{24})$/).respond(sampleVideo);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.video).toEqualData(sampleVideo);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Videos) {
			// Create a sample Video object
			var sampleVideoPostData = new Videos({
				name: 'New Video'
			});

			// Create a sample Video response
			var sampleVideoResponse = new Videos({
				_id: '525cf20451979dea2c000001',
				name: 'New Video'
			});

			// Fixture mock form input values
			scope.name = 'New Video';

			// Set POST response
			$httpBackend.expectPOST('videos', sampleVideoPostData).respond(sampleVideoResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Video was created
			expect($location.path()).toBe('/videos/' + sampleVideoResponse._id);
		}));

		it('$scope.update() should update a valid Video', inject(function(Videos) {
			// Define a sample Video put data
			var sampleVideoPutData = new Videos({
				_id: '525cf20451979dea2c000001',
				name: 'New Video'
			});

			// Mock Video in scope
			scope.video = sampleVideoPutData;

			// Set PUT response
			$httpBackend.expectPUT(/videos\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/videos/' + sampleVideoPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid videoId and remove the Video from the scope', inject(function(Videos) {
			// Create new Video object
			var sampleVideo = new Videos({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Videos array and include the Video
			scope.videos = [sampleVideo];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/videos\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleVideo);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.videos.length).toBe(0);
		}));
	});
}());