const knex = require('../connection');

function createImage({imageID, instaID, data, hashtag}) {
	const imageRow = {
		image_id: imageID,
		insta_id: instaID
	};

	if (data) {
		imageRow.raw_data = JSON.stringify(data);
	}

	if (hashtag) {
		imageRow.hashtag = hashtag;
	}

	return knex('images').insert(imageRow);
}

function getImageByInstaID({instaID}) {
	return knex('images').where('insta_id', instaID).first();
}

function getImagesToBeDetected() {
	return knex('images')
		.whereNull('should_ignore')
		.where('raw_data', null)
		.limit(3);
}

function markImageAsIgnored(instaID) {
	return knex('images')
		.update({
			should_ignore: true
		})
		.where('insta_id', instaID);
}

function addDetectionDataToImage({instaID, data}) {
	return knex('images')
		.update({
			raw_data: data
		})
		.where('insta_id', instaID);
}

async function getDetectedImages({offset} = {}) {
	const limit = 50;

	if (offset) {
		offset = parseInt(offset);
	}

	function random(min,max) {
		return Math.floor(Math.random() * (max - min + 1) + min);
	}

	const numberOfDetectedImages = await getCountOfDetectedImages();

	const randomOffset = random(0, numberOfDetectedImages - limit);
	const finalOffset = Number.isInteger(offset) ? offset : randomOffset;

	console.log(`Getting detected images from offset: ${finalOffset}`);

	const result = await knex('images')
		.whereNotNull('raw_data')
		.andWhere({
			should_ignore: null
		})
		.offset(finalOffset)
		.limit(limit);

	return result;
}

async function getCountOfPendingImagesToBeDetected() {
	const result = await knex('images')
		.whereNull('raw_data')
		.andWhere({
			should_ignore: null
		}).count('id');

	return Object.values(result[0])[0];
}

async function getCountOfDetectedImages() {
	const result = await knex('images')
		.whereNotNull('raw_data')
		.andWhere({
			should_ignore: null
		}).count('id');

	return Object.values(result[0])[0];
}

module.exports = {
	createImage,
	getImageByInstaID,
	getImagesToBeDetected,
	markImageAsIgnored,
	addDetectionDataToImage,
	getCountOfPendingImagesToBeDetected,
	getDetectedImages,
	getCountOfDetectedImages
};
