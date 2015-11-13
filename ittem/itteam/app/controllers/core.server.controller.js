'use strict';
var cfg = require('../../config/config'),
	videosController = require('./videos.server.controller'),
	booksController = require('./books.server.controller'),
	blogController = require('./blog.server.controller'),
	aboutController = require('./about.server.controller'),
	path = require('path'),
	_ = require('lodash'),
	readChunk = require('read-chunk'),
	fileType = require('file-type'),
	uuid = require('uuid'),
	fs = require('fs-extra'),
	imagemagick = require('imagemagick-native'),
	_Promise = require('promise');

/**
 * Module dependencies.
 */
exports.index = function(req, res) {
	res.render('index', {
		user: req.user || null,
		request: req,
		public_api_key: cfg.public_key
	});
};

exports.upload = function (req, res) {
	var dstPath = path.normalize(cfg.uploadDir),
		dstFile = uuid.v4(),
		file = req.files.file,
		location = req.body.location,
		bfr = readChunk.sync(file.path, 0, 262),
		ft = fileType(bfr),
		thumbPath,
		thp,
		tstMime;
    
    if (location.indexOf('videos') > -1) thp = '/thumb/video/';
    else thp = '/thumb/book/';
    
	tstMime = function (type) {
		var supported = {
			'image/png': true,
			'image/jpg': true,
			'image/jpeg': true
		};
		return (type.mime in supported);
	};

	if (ft && tstMime(ft)) {
		dstFile += '.' + ft.ext;
		thumbPath = dstPath + thp + dstFile;
		dstPath += '/upload/' + dstFile;

		fs.copy(file.path, dstPath, function (err) {
			if (err) return res.status(400).send(err);
			else {

				imagemagick.convert({
				    srcData: fs.readFileSync(dstPath),
				    width: /books/.test(location)? cfg.thumbDimensions.bok.width: cfg.thumbDimensions.vid.width,
				    height: /books/.test(location)? cfg.thumbDimensions.bok.height: cfg.thumbDimensions.vid.height,
				    strip: true,
				    resizeStyle: 'aspectfill', // is the default, or 'aspectfit' or 'fill'
				    gravity: 'Center' // optional: position crop area when using 'aspectfill'
				},function (err, buffer) {
					if (err) return res.status(400).send(err);
					else {
						fs.writeFileSync(thumbPath, buffer);
						return res.jsonp({
							path: dstFile
						});						
					}
				});


/***
				easyimage.thumbnail({
					src: dstPath,
					dst: thumbPath,
					width: /books/.test(location)? cfg.booksThumbDimensions.width: cfg.videoThumbDimensions.width,
					height: /books/.test(location)? cfg.booksThumbDimensions.height: cfg.videoThumbDimensions.height
				}).
				then(
					function () {
						return res.jsonp({
							path: dstFile
						});
					},
					function (err) {
						return res.status(400).send(err);
					}
				);

**/
			}
		});
	} else {
		return res.sendStatus(415);
	}
};

exports.search = function (req, res) {
	var promises = [
		videosController.search(req, res),
		booksController.search(req, res),
		blogController.search(req, res)
	];

	_Promise.all(promises).then(
		function (data) {
			var videos,
				books,
				blogs,
				all = [];

			videos = _.map(data[0].data, function (v) {
				v = v.toObject();
				v._type = 'video';
				return v;
			});
			books = _.map(data[1], function (b) {
				b = b.toObject();
				b._type = 'book';
				return b;
			});
			blogs = _.map(data[2], function (b) {
				b = b.toObject();
				b._type = 'post';
				return b;
			});
			if ('blog' in req.query) {
				all = blogs;
			} else if ('category' in req.query) {
				all = videos;
			} else if ('book' in req.query) {
				all = books;
			} else {
				all = all.concat(videos).concat(books).concat(blogs);
			}
			all = _.sortBy(all, function (d) {
				return -d.score;
			});

			return res.jsonp(all);
		},
		function (err) {
			return res.send(err).status(400).end();
		}
	);
};
