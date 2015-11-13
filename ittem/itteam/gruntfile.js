'use strict';

var _promise = require('promise'),
	_ = require('lodash');

module.exports = function(grunt) {
	// Unified Watch Object
	var watchFiles = {
		serverViews: ['app/views/**/*.*'],
		serverJS: ['gruntfile.js', 'server.js', 'config/**/*.js', 'app/**/*.js'],
		clientViews: ['public/modules/**/views/**/*.html'],
		clientJS: ['public/js/*.js', 'public/modules/**/*.js', 'public/application.js', 'public/config.js'],
		clientCSS: ['public/modules/**/*.css'],
		mochaTests: ['app/tests/**/*.js']
	};

	// Project Configuration
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		watch: {
			serverViews: {
				files: watchFiles.serverViews,
				options: {
					livereload: true
				}
			},
			serverJS: {
				files: watchFiles.serverJS,
				tasks: ['jshint'],
				options: {
					livereload: true
				}
			},
			clientViews: {
				files: watchFiles.clientViews,
				options: {
					livereload: true,
				}
			},
			clientJS: {
				files: watchFiles.clientJS,
				tasks: ['jshint'],
				options: {
					livereload: true
				}
			},
			clientCSS: {
				files: watchFiles.clientCSS,
				tasks: ['csslint'],
				options: {
					livereload: true
				}
			}
		},
		jshint: {
			all: {
				src: watchFiles.clientJS.concat(watchFiles.serverJS),
				options: {
					jshintrc: true
				}
			}
		},
		csslint: {
			options: {
				csslintrc: '.csslintrc',
			},
			all: {
				src: watchFiles.clientCSS
			}
		},
		uglify: {
			production: {
				options: {
					mangle: false
				},
				files: {
					'public/dist/application.min.js': '<%= applicationJavaScriptFiles %>'
                }
			}
		},
		cssmin: {
			combine: {
				files: {
					'public/dist/application.min.css': '<%= applicationCSSFiles %>',
                    'public/dist/vendor.min.css': '<%= vendorCSSFiles %>'
				}
			}
		},
        concat: {
            production: {
                options: {
                    stripBanners: false
                },
                files: {
                    'public/dist/vendor.min.js': '<%= vendorJavaScriptFiles %>'
                }
            }
        },
		nodemon: {
			dev: {
				script: 'server.js',
				options: {
					nodeArgs: ['--debug'],
					ext: 'js,html',
					watch: watchFiles.serverViews.concat(watchFiles.serverJS)
				}
			}
		},
		'node-inspector': {
			custom: {
				options: {
					'web-port': 1337,
					'web-host': 'localhost',
					'debug-port': 5858,
					'save-live-edit': true,
					'no-preload': true,
					'stack-trace-limit': 50,
					'hidden': []
				}
			}
		},
		ngAnnotate: {
			production: {
				files: {
					'public/dist/application.js': '<%= applicationJavaScriptFiles %>'
				}
			}
		},
		concurrent: {
			default: ['nodemon', 'watch'],
			debug: ['nodemon', 'watch', 'node-inspector'],
			options: {
				logConcurrentOutput: true,
				limit: 10
			}
		},
		env: {
			test: {
				NODE_ENV: 'test'
			},
			secure: {
				NODE_ENV: 'secure'
			},
            build: {
                NODE_ENV: 'build'
            },
            production: {
                NODE_ENV: 'production'
            }
		},
		mochaTest: {
			src: watchFiles.mochaTests,
			options: {
				reporter: 'spec',
				require: 'server.js'
			}
		},
		karma: {
			unit: {
				configFile: 'karma.conf.js'
			}
		},
		forever: {
			server: {
				options: {
					index: 'server.js'
				}
			}
		},
		replace: {
			keys: {
				src: 'public/read_key.tpl',
				dest: 'public/read_key.js',
				replacements: [{
					from: '__READKEY__',
					to: '<%= read_key %>'
				}]
			}
		}
	});

	// Load NPM tasks
	require('load-grunt-tasks')(grunt);
    grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-text-replace');

	// Making grunt default to force in order not to break the project.
	grunt.option('force', true);

	// A Task for loading the configuration object
	grunt.task.registerTask('loadConfig', 'Task that loads the config into a grunt option.', function() {
		var init = require('./config/init')();
		var config = require('./config/config');

		grunt.config.set('applicationJavaScriptFiles', config.assets.js);
		grunt.config.set('applicationCSSFiles', config.assets.css);
        grunt.config.set('vendorJavaScriptFiles', config.assets.lib.js);
        grunt.config.set('vendorCSSFiles', config.assets.lib.css);
		grunt.config.set('read_key', config.public_key);
	});

	// Default task(s).
	grunt.registerTask('default', ['lint', 'concurrent:default']);

	// Debug task.
	grunt.registerTask('debug', ['lint', 'concurrent:debug']);

	// Secure task(s).
	grunt.registerTask('secure', ['env:secure', 'lint', 'concurrent:default']);

	// Lint task(s).
	grunt.registerTask('lint', ['jshint', 'csslint']);

	// Build task(s).
	grunt.registerTask('build', ['env:build', 'lint', 'loadConfig', 'ngAnnotate', 'replace:keys', 'uglify', 'cssmin', 'concat', 'copyFonts']);

    // Production.
    grunt.registerTask('production_run', ['env:production', 'forever:server:start']);
	grunt.registerTask('production_stop', ['env:production', 'forever:server:stop']);

	// Test task.
	//grunt.registerTask('test', ['env:test', 'mochaTest', 'karma:unit']);
    grunt.registerTask('test', ['env:test', 'mochaTest']);

    grunt.registerTask('copyFonts', 'Copies fonts.', function () {
        var done = this.async(),
            fs = require('fs-extra'),
            cpy;

        cpy = function () {    
            fs.copy('./public/lib/bootstrap/dist/fonts', './public/fonts', function (err) {
                if (err) return console.error(err);
	        	fs.copy('./public/modules/core/fonts', './public/fonts', function (err) {
	                if (err) return console.error(err);
	            });                
				fs.copy('./public/lib/font-awesome/fonts', './public/fonts', function (err) {
					if (err) return console.error(err);
					done();
				});
            });

        };
        fs.exists('./public/fonts', function (exists) {
            if (exists) fs.remove('./public/fonts', cpy);
            else cpy();
        });
    });

	grunt.registerTask('dropDatabase', 'Drops the database', function () {
		var done = this.async(),
			server = require('./server'),
			mongoose = require('mongoose');
		/*jshint -W030 */
		grunt;
		server.onReady(function () {
			mongoose.connection.db.dropDatabase();
			done();
		});
	});

	// Fill mock users and data.
	grunt.registerTask('fillData', 'Fills the database', function () {
		var done = this.async();
		var server = require('./server'),
			mockVideos = require('./var/mock_data/videos'),
			mockUsers = require('./var/mock_data/users'),
			mockBooks = require('./var/mock_data/books'),
			mockPosts = require('./var/mock_data/posts'),
			mockAbout = require('./var/mock_data/about'),
			mongoose = require('mongoose');

		server.onReady(function () {
			var Video = mongoose.model('Video'),
				User  = mongoose.model('User'),
				Book = mongoose.model('Book'),
			 	Post = mongoose.model('Post'),
			 	About = mongoose.model('About'),
				usrs,
				psts,
				abts,
			 	vds,
				bks,
			 	all;

			usrs = _.map(mockUsers, function (usr) {
				return new User(usr);
			});
			vds = _.map(mockVideos, function (v) {
				return new Video(v);
			});
			bks = _.map(mockBooks, function (b) {
				return new Book(b);
			});
			psts = _.map(mockPosts, function (p) {
				return new Post(p);
			});
			abts = _.map(mockAbout, function (p) {
				return new About(p);
			});
			all = usrs.concat(vds).concat(bks).concat(psts).concat(abts);

			_promise.all(_.map(all, function (obj) {
				return new _promise(function (resolve, reject) {
					obj.save(function (err, o) {
						if (err) reject();
						else resolve();
					});
				});
			})).then(done, function () {
				// some rejected
				grunt.fail.fatal('Failed saving.');
			});
		});
	});
};
