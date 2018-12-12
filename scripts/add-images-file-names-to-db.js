const path = require('path');
const fs = require('fs');
const config = require('config');
const imageQueries = require('../src/server/db/queries/images');

const downloadDirectory = config.get('downloadsDirectory');

async function start() {
	let directoryListing;

	try {
		directoryListing = fs.readdirSync(downloadDirectory);
	} catch (err) {
		console.log({err});
		throw new Error('Error reading existing image directory');
	}

	const existingImageFileNames = directoryListing
		.filter(file => file.endsWith('.jpg'));

	for (const fileName of existingImageFileNames) {
		const instaID = fileName.split('--')[0];

		try {
			const result = await imageQueries.getImageByInstaID({
				instaID
			});

			if (result) {
				console.log(`Existing image record found, skipping ${instaID}`);
				continue;
			}
		} catch (err) {
			console.log(err);
			process.exit(1);
		}

		try {
			await imageQueries.createImage({
				imageID: fileName,
				hashtag: 'selfie',
				instaID
			});
		} catch (err) {
			console.log(err);
			process.exit(1);
		}
	}
}

start().then(() => {
	process.exit();
});
