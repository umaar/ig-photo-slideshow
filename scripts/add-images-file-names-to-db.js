const path = require('path');
const fs = require('fs');
const config = require('config');
const imageQueries = require('../src/server/db/queries/images');

const downloadDirectories = config.get('downloadDirectories');

async function addImages({currentPath, hashtag}) {
	let directoryListing;

	try {
		directoryListing = fs.readdirSync(currentPath);
	} catch (error) {
		console.log({error});
		throw new Error('Error reading existing image directory');
	}

	const existingImageFileNames = directoryListing
		.filter(file => {
			return file.endsWith('.jpg') || file.endsWith('.png');
		});

	console.log(`There are ${existingImageFileNames.length} image files in ${currentPath}`);

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
		} catch (error) {
			console.log(`Error for ${currentPath}:\n`, error);
			process.exit(1);
		}

		try {
			await imageQueries.createImage({
				imageID: fileName,
				hashtag,
				instaID
			});

			insertedRecordsCount++;
		} catch (error) {
			console.log(error);
			process.exit(1);
		}
	}

	console.log(`Inserted ${insertedRecordsCount} records into the database for ${currentPath}`);
}

async function start() {
	for (downloadDirectory of downloadDirectories) {
		console.log('\n');
		await addImages({currentPath: downloadDirectory.path, hashtag: downloadDirectory.hashtag});
	}
}

start().then(() => {
	console.log('\n\nAll done!');
	process.exit();
});
