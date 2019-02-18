(function (appConfig) {
	'use strict';

	// Const rev = require('express-rev');
	const path = require('path');
	const bodyParser = require('body-parser');
	const knex = require('../db/connection');
	const nunjucks = require('nunjucks');
	const config = require('config');

	const viewFolders = [
		path.join(__dirname, '..', 'views')
	];

	const oneHourInMillis = 1000 * 60 * 60;

	// Load environment variables
	appConfig.init = function (app, express) {
		app.disable('x-powered-by');

		const nunjucksEnv = nunjucks.configure(viewFolders, {
			express: app,
			autoescape: true
		});

		app.locals.config = {
			global: 'this is global'
		};

		app.set('view engine', 'html');

		// *** Middlewares *** //

		// app.use(rev({
		// 	manifest: 'dist/rev-manifest.json',
		// 	prepend: ''
		// }));

		app.use('/assets', express.static('src/client'));

		app.use(bodyParser.json());
		app.use(bodyParser.urlencoded({
			extended: false
		}));

		// App.use(express.static('dist', {
		// 	maxAge: '1y'
		// }));

		const downloadsDirectories = config.get('downloadDirectories');
		const igStaticImageRootPath = config.get('ig-static-image-root-path');

		for (const downloadDirectory of downloadsDirectories) {
			const urlPath = `${igStaticImageRootPath}/${downloadDirectory.hashtag}`;
			console.log('adding: ', urlPath);
			app.use(urlPath, express.static(downloadDirectory.path));
		}

	};
})(module.exports);
