/**
 * Handles blog posts.
 */


var mongoose = require('mongoose');

/**************************************************************
 * Schema definition
 **************************************************************/

/**
 * Mongoose schema for a blog post.
 * @type {mongoose.Schema}
 */
var postSchema = new mongoose.Schema({
  date:     {type: Date, default: Date.now},
  author:   String,
  title:    String,
  content:  String
});

// Create a reverse index on date so we can sort on it quicker
postSchema.index({date: -1});

// Create post object from schema
var Post = mongoose.model('Post', postSchema);

/**************************************************************
 * API Functions
 **************************************************************/

/**
 * Gets all posts, sorted in reverse order by date, then renders the post
 * template, writing the posts into the template.
 *
 * @param {Object} req Request object.
 * @param {Object} res Response object.
 */
exports.getPosts = function(req, res) {

  // Find all posts, sorted desc by date. Return plain JSON objects (not
  // mongoose objects) by specifying lean(true). Return all fields but content.
  Post.find({}, 'date author title').sort({date: -1}).lean(true).exec(function(err, posts) {
    if (err) {
      res.send(500, 'Database Error. Could not get posts.');
      return;
    }

    res.render('index', {
      blogPosts: posts
    });
  });
};

/**
 * Gets the content for a specific post and returns as JSON.
 * Expected to be called via AJAX request.
 *
 * @param {Object} req Request object.
 * @param {Object} res Response object.
 */
exports.getPostContent = function(req, res) {
  // Make sure a post ID was provided
  if (!req.params.postId) {
    res.send(400, 'Missing Post ID');
    return;
  }

  // Get the document for the single post
  Post.findById(req.params.postId, 'content').lean(true).exec(function(err, post) {
    if (err) {
      res.send(500, 'Database Error. Could not get post.');
      return;
    }

    res.set('Content-Type', 'text/json');
    res.json(post);
  });
};

/**
 * Saves a new post. Expected to be called via AJAX request.
 *
 * @param {Object} req Request object.
 * @param {Object} res Response object.
 */
exports.savePost = function(req, res) {

  if (req.body._id) {
    var post = new Post(req.body);
    
    Post.modify({_id: req.body._id}, {
      '$set': {
        title:    req.body.title,
        author:   req.body.author,
        content:  req.body.content
      }
    }, function(err) {

      res.set('Content-Type', 'text/json');
      res.json({_id: req.body._id, modified: true});
    });

  } else {

    var post = new Post(req.body);

    post.save(function(err) {
      if (err) {
        res.send(500, 'Database Error. Could not save post.');
        return;
      }

      res.set('Content-Type', 'text/json');
      res.json(post);
    });
  }
};

