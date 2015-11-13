'use strict';

// Books controller
angular.module('books')

	.controller('BooksListController', ['$scope', '$stateParams', 'Authentication', 'Books', 'Roles', 'PageTitle', 'MetaInformation', 'Authors', '_', 'GetterFromServer',
		function ($scope, $stateParams, Authentication, Books, Roles, PageTitle, MetaInformation, Authors, _, GetterFromServer) {
			$scope.$emit('LOAD');
			$scope.authentication = Authentication;
			$scope.Roles = Roles;

			PageTitle.setTitle('Books');
			MetaInformation.setMetaDescription('Books');

			GetterFromServer.featured('book').then(function (data) {
				$scope.featured = data.data;
			});

			Authors.query().then(function (result) {
				$scope.authors = result.data;
				$scope.selectedAuthors = [];
				return result.data;
			});
			$scope.find = function () {
				$scope.originalBooks = $scope.books = Books.query($stateParams);
				$scope.canCreate = Roles.hasAtLeastRole('editor');
				$scope.$emit('UNLOAD');
			};
			$scope.filter = function (author, e) {
				e.preventDefault();
				$scope.books = _.filter($scope.originalBooks, function (item) {
					return author._id === item.author;
				});
				resetActive();
				$scope.selectedAuthors.push(author);
				author.active = true;
				$scope.filtered = true;
			};
			$scope.resetFilter = function () {
				$scope.books = $scope.originalBooks;
				resetActive();
				$scope.filtered = false;
			};
			function resetActive() {
				$scope.selectedAuthors = [];
				_.forEach($scope.authors, function (item) {
					item.active = false;
				});
			}
		}])

	.controller('BooksViewController', ['$scope', '$stateParams', '$timeout', '$location', '$anchorScroll', '$sce', 'Authentication', 'Roles', 'Books', '_', 'PageTitle', 'MetaInformation',
		function ($scope, $stateParams, $timeout, $location, $anchorScroll, $sce, Authentication, Roles, Books, _, PageTitle, MetaInformation) {
			$scope.$emit('LOAD');
			$scope.authentication = Authentication;
			$scope.Roles = Roles;
			$scope.menuTitle = {
				chapter: {
					title: {}
				},
				subchapter: {
					title: {}
				}
			};
			$scope.update = function () {
				checkLang();
				PageTitle.setTitle($scope.book.title[$scope.lang]);
				MetaInformation.setMetaDescription($scope.book.description[$scope.lang]);
				var options = {
					chapterNo: $location.search().chapterNo || 0,
					subChapterNo: $location.search().subChapterNo
				};
				/*jshint ignore:start*/
				if ($scope.book.author != null) $scope.book.author = $scope.book.author.value;
				/*jshint ignore:end*/
				$scope.canEdit = Roles.hasAtLeastRole('reviewer') || (
					Authentication.user && (
						$scope.book.user === Authentication.user._id ||
						($scope.book.author && $scope.book.author === Authentication.user._id)
					)
				);
				$scope.editUrl = options.subChapterNo || options.subChapterNo === 0 ?
					'/#!/books/'+$scope.book._id+'/edit?chapterNo='+options.chapterNo+'&subChapterNo='+options.subChapterNo
					:'/#!/books/'+$scope.book._id+'/edit?chapterNo='+options.chapterNo;
				$scope.content = $scope.book.content;
				changeTitle();
				$scope.$emit('UNLOAD');
			};
			function checkLang () {
				if ($scope.book.booklanguage.length !== 2) {
					$scope.lang = $scope.book.booklanguage[0] === 'English' ? 'en': 'ur';
				} else {
					$scope.lang = 'en';
				}
			}

			$scope.findOne = function () {
				$scope.book = Books.get({
					bookId: $stateParams.bookId,
					chapterNo: $location.search().chapterNo,
					subChapterNo: $location.search().subChapterNo
				});
				$scope.book.$promise.then($scope.update);
			};

			$scope.updateProp = function (property, data) {
				var book = $scope.book;
				if (property === 'en' || property === 'ur'){
					book.title[property] = data;
				}

				book[property] = data;
				return book.$update();
			};

			$scope.remove = function () {
				if (!$scope.book) return;

				$scope.book.$remove(function () {
					$location.path('books');
				});
			};

			$scope.close = function () {
				$scope.book.status = 'closed';
				return $scope.book.$update();
			};

			$scope.open = function () {
				$scope.book.status = 'open';
				return $scope.book.$update();
			};

			$scope.switchChapter = function (ch, sc) {
				$location.search({'chapterNo': ch, 'subChapterNo': sc});
			};
			function changeTitle() {
				if ($location.search().subChapterNo || $location.search().subChapterNo === 0) {
					$scope.menuTitle.subchapter.title = $scope.book.tableOfContents[$location.search().chapterNo].subchapters[$location.search().subChapterNo];
					$scope.menuTitle.chapter.title = $scope.book.tableOfContents[$location.search().chapterNo].title;
					PageTitle.setTitle($scope.book.title[$scope.lang] + ' - ' + $scope.menuTitle.chapter.title[$scope.lang] + ': ' + $scope.menuTitle.subchapter.title[$scope.lang]);
				} else {
					$scope.menuTitle.subchapter.title = $location.search().chapterNo ?
						$scope.book.tableOfContents[$location.search().chapterNo].title:
						$scope.book.content.title;
					$scope.menuTitle.chapter.title = null;
					PageTitle.setTitle($scope.book.title[$scope.lang] + ' - ' + $scope.menuTitle.subchapter.title[$scope.lang]);
				}
			}
			$scope.changeLang = function () {
				$scope.lang = $scope.lang === 'en'? 'ur': 'en';
				changeTitle();
			};
			angular.element(window).on('scroll', function () {
				$scope.$apply($scope.isAffixNow = angular.element(document).scrollTop() !== 0);
			});
		}])

	.controller('BooksCreateController', [
		'$scope',
		'$location',
		'Authentication',
		'BookFormSchema',
		'Books',
		'Authors',
		'Upload',
		'chapterSanitizer',
		'PageTitle',
		'MetaInformation',
		'_',
		function ($scope, $location, Authentication, BookFormSchema, Books, Authors, Upload, chapterSanitizer, PageTitle, MetaInformation, _) {
			$scope.authentication = Authentication;
			$scope.bookFormSchema = BookFormSchema;
			$scope.book = {};
			$scope.isCreating = true;
			PageTitle.setTitle('Create book');
			MetaInformation.setMetaDescription('Create book');
			Authors.query().then(function (result) {
				$scope.authors = result.data;
				return result.data;
			});
			/* jshint ignore:start */
			$scope.upload = function (files) {
				if (files && files.length) {
					for (var i = 0; i < files.length; i++) {
						var file = files[i];
						Upload.upload({
							url: 'api/upload',
							fields: {'location': $location.path()},
							file: file
						}).success(function (data) {
							$scope.book.thumbnail = data.path;
						}).error(function (data, status) {
							console.log('error status: ' + status);
						});
					}
				}
			};
			/* jshint ignore:end */
			$scope.create = function () {
				var book = $scope.book;
				book.booklanguage = _.keys(_.pick(book.language, function (key ,val){
					return val;
				}));
				book.author = book.author._id;
				//book.chapters = chapterSanitizer(book.chapters);
				book = new Books(book);

				//$scope.$broadcast('schemaFormValidate');
				//if (!form.$valid) return;

				book.$save(function (response) {
					$location.path('books/' + response._id + '/add');
				}, function (errorResponse) {
					$scope.error = errorResponse.data.message;
				});
			};
		}])

	.controller('BooksEditController', [
		'$scope',
		'$location',
		'Authentication',
		'BookFormSchema',
		'chapterSanitizer',
		'book',
		'Authors',
		'Upload',
		'PageTitle',
		'MetaInformation',
		'_',
		function ($scope, $location, Authentication, BookFormSchema, chapterSanitizer, book, Authors, Upload, PageTitle, MetaInformation, _) {
			$scope.authentication = Authentication;
			$scope.book = book;
			$scope.book.language = {};
			_.each(book.booklanguage, function (lang) {
				$scope.book.language[lang] = true;
			});
			$scope.bookFormSchema = BookFormSchema;
			var q = $location.search();
			$scope.backUrl = 'books/' + book._id + '?chapterNo='+q.chapterNo;
			if (q.subChapterNo) $scope.backUrl += '&subChapterNo='+ q.subChapterNo;
			PageTitle.setTitle('Edit book');
			MetaInformation.setMetaDescription('Edit book');
			Authors.query().then(function (result) {
				$scope.authors = result.data;
				$scope.book.author = _.find($scope.authors, {_id: $scope.book.author.value});
				return result.data;
			});
			/* jshint ignore:start */
			$scope.upload = function (files) {
				if (files && files.length) {
					for (var i = 0; i < files.length; i++) {
						var file = files[i];
						Upload.upload({
							url: 'api/upload',
							fields: {'location': $location.path()},
							file: file
						}).success(function (data) {
							$scope.book.thumbnail = data.path;
						}).error(function (data, status) {
							console.log('error status: ' + status);
						});
					}
				}
			};
			/* jshint ignore:end */
			// Update existing Book
			$scope.update = function (form) {
				var book = $scope.book;
				//book.chapters = chapterSanitizer(book.chapters);

				//$scope.$broadcast('schemaFormValidate');
				//if (!form.$valid) return;
				book.booklanguage = _.keys(_.pick(book.language, function (key ,val){
					return val;
				}));
				book.author = book.author._id;
				book.$update($location.search(), function () {
					$location.path('books/' + book._id);
				}, function (errorResponse) {
					$scope.error = errorResponse.data.message;
				});
			};
		}])
	.controller('BooksAddController', [
		'$scope',
		'$location',
		'$timeout',
		'$stateParams',
		'Books',
		'Authentication',
		'PageTitle',
		'MetaInformation',
		function ($scope, $location, $timeout, $stateParams, Books, Authentication, PageTitle, MetaInformation) {
			$scope.authentication = Authentication;
			PageTitle.setTitle('Add content');
			MetaInformation.setMetaDescription('Add content');

			$scope.getBook = function () {
				$scope.book = Books.get({
					bookId: $stateParams.bookId,
					info: true
				});
			};
			$scope.closeAlert = function () {
				$scope.info = null;
			};
			$scope.save = function () {
				$scope.book.$save(function (response) {
					$scope.info = {
						status: 'success',
						message: 'Content has been added'
					};
					$scope.getBook();
					$timeout($scope.closeAlert, 3000);
				}, function (errorResponse) {
					$scope.info = {
						status: 'danger',
						message: 'Something went wrong'
					};
					$timeout($scope.closeAlert, 3000);
				});
			};
		}
	])
;
