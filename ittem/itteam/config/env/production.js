'use strict';

module.exports = {
	db: 'mongodb://localhost/portal-dev',
	contentLimit: process.env.CONTENT_LIMIT || '50mb',
	assets: {
		lib: {
			css: [],
			js: []
		},
		css: [
			'public/dist/vendor.min.css',
			'public/dist/application.min.css'
		],
		js: [
			'public/dist/vendor.min.js',
			'public/dist/application.min.js'
		]
	},
	public_key: 'jC91226zy59XfYvinZg4REun2qnG1x4d',
	token_expiry: 24,
	sessionSecret: '37fgbn846ga9yghji98765rfgnm98r',
	facebook: {
		clientID: process.env.FACEBOOK_ID || '477253432432778',
		clientSecret: process.env.FACEBOOK_SECRET || 'c814af3f5f009dfd7167fccbfb5fd7b4',
		callbackURL: '/auth/facebook/callback'
	},
	twitter: {
		clientID: process.env.TWITTER_KEY || 'IgPsYgcagQNz9utG1p8oHDQep',
		clientSecret: process.env.TWITTER_SECRET || 'rF1Y1fxOtouvdr6VNzEAPVvDK3tvzTbPBob2rsSFOKtxd4aQNd',
		callbackURL: '/auth/twitter/callback'
	},
	google: {
		clientID: process.env.GOOGLE_ID || '296392781182-egit2j52q288agd09dphd7u7411ktu1q.apps.googleusercontent.com',
		clientSecret: process.env.GOOGLE_SECRET || 'r6WNuOrWiQvzMm9vXUYGS0HW',
		callbackURL: '/auth/google/callback'
	},
	linkedin: {
		clientID: process.env.LINKEDIN_ID || 'APP_ID',
		clientSecret: process.env.LINKEDIN_SECRET || 'APP_SECRET',
		callbackURL: '/auth/linkedin/callback'
	},
	github: {
		clientID: process.env.GITHUB_ID || 'APP_ID',
		clientSecret: process.env.GITHUB_SECRET || 'APP_SECRET',
		callbackURL: '/auth/github/callback'
	},
	mailer: {
		from: process.env.MAILER_FROM || 'MAILER_FROM',
		options: {
			service: process.env.MAILER_SERVICE_PROVIDER || 'MAILER_SERVICE_PROVIDER',
			auth: {
				user: process.env.MAILER_EMAIL_ID || 'MAILER_EMAIL_ID',
				pass: process.env.MAILER_PASSWORD || 'MAILER_PASSWORD'
			}
		}
	}
};
