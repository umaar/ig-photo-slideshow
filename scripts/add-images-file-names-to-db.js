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

	console.log(`There are ${existingImageFileNames.length} image files in ${downloadDirectory}`);

	let insertedRecordsCount = 0;

	for (const fileName of existingImageFileNames) {
		const instaID = fileName.split('--')[0];

		try {
			const result = await imageQueries.getImageByInstaID({
				instaID
			});

			if (result) {
				continue;
			}
		} catch (err) {
			console.log('Error:\n', err);
			process.exit(1);
		}

		try {
			await imageQueries.createImage({
				imageID: fileName,
				hashtag: 'selfie',
				instaID
			});

			insertedRecordsCount++;
		} catch (err) {
			console.log(err);
			process.exit(1);
		}
	}

	console.log(`Inserted ${insertedRecordsCount} records into the database`);
}

start().then(() => {
	process.exit();
});
