
var Controllers = (function(Controllers, blogPosts) {

  "use strict";

  /**
   * Controller for posts list.
   */
  Controllers.Posts = function($scope, $http) {
    // Bring the blog posts into the scope of this controller
    $scope.posts = blogPosts;

    /**
     * Shows the post at the given index by redirecting the user.
     * @param {Number} idx
     */
    $scope.showPost = function(post) {

      // If the post is showing, hide it. Else, if we already
      // have the post content, just show it
      if (post.show) {
        post.show = false;
        return;
      } else if (post.content) {
        post.show = true;
        return;
      }

      // Asynchronously get the post content and display it
      $http.get('/post/' + post._id).success(function(p) {
        post.content = p.content;
        post.show = true;
      });
    };
  };
  Controllers.Posts.$inject = ['$scope','$http'];

  /**
   * Controller for posts list.
   */
  Controllers.NewPost = function($scope, $http) {

    /**
     * Submits the new post.
     */
    $scope.submit = function(idx) {
      if (!$scope.title) {
        alert('Missing Title');
        return;
      }

      if (!$scope.author) {
        alert('Missing Author');
        return;
      }

      if (!$scope.content) {
        alert('Missing Content');
        return;
      }

      var post = {
        title:    $scope.title,
        author:   $scope.author,
        content:  $scope.content
      };

      // Asynchronously get the post content and display it
      $http.post('/post/save', post).success(function(p) {
        // Add new post to blog roll
        blogPosts.unshift(p);

        // Reset form
        $scope.title = '';
        $scope.author = '';
        $scope.content = '';
      });
    };
  };
  Controllers.NewPost.$inject = ['$scope','$http'];

  return Controllers;

})(Controllers || {}, blogPosts);