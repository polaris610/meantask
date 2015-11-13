
/**
 * Module dependencies.
 */

var express   = require('express'),
    http      = require('http'),
    path      = require('path'),
    mongoose  = require('mongoose'),
    Post      = require('./lib/post.js');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/posts', Post.getPosts);
app.get('/post/:postId', Post.getPostContent);
app.post('/post/save', Post.savePost);

// Connect to mongo before starting the server
mongoose.connect('127.0.0.1', 'mean-demo-blog', 27017, function(err) {
  if (err) {
    console.log('Could not connect to mongo: ' + err);
    process.exit(1);
  }

  // We've connected to Mongo, so start the web server
  http.createServer(app).listen(app.get('port'), function(){
    console.log('Demo server listening on port ' + app.get('port'));
  });
});
