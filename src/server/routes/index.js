const express = require('express');
const config = require('config');

const imageQueries = require('../db/queries/images');

/* eslint-disable new-cap */
const router = express.Router();
/* eslint-enable new-cap */

const igStaticImageRootPath = config.get('ig-static-image-root-path');

router.get('/', (req, res) => {
	const renderObject = {
		text: 'Use the navigation'
	};

	res.render('index', renderObject);
});

router.get('/face-slideshow', async (req, res) => {
	const hashtag = req.query.hashtag;
	const rawDetectedImages = await imageQueries.getDetectedImages({
		offset: req.query.offset,
		hashtag
	});

	const detectedImages = rawDetectedImages.map(row => {
		return {
			src: `${igStaticImageRootPath}/${row.hashtag}/${row.image_id}`,
			data: row.raw_data
		};
	});

	const renderObject = {
		images: detectedImages
	};

	res.render('face-slideshow', renderObject);
});

router.get('/view-detected-faces', async (req, res) => {
	const hashtag = req.query.hashtag;
	const rawDetectedImages = await imageQueries.getDetectedImages({hashtag});
	const numberOfDetectedImages = await imageQueries.getCountOfDetectedImages({hashtag});

	const detectedImages = rawDetectedImages.map(row => {
		return {
			src: `${igStaticImageRootPath}/${row.hashtag}/${row.image_id}`,
			data: row.raw_data
		};
	});

	const renderObject = {
		images: detectedImages,
		messages: [{
			status: 'status',
			value: `${detectedImages.length} images on this page. ${numberOfDetectedImages} detected images in total`
		}]
	};

	res.render('view-detected-faces', renderObject);
});

router.get('/perform-face-detection', async (req, res) => {
	const rawImagesToBeDetected = await imageQueries.getImagesToBeDetected();
	const pendingImagesCount = await imageQueries.getCountOfPendingImagesToBeDetected();

	const imagesToBeDetected = rawImagesToBeDetected.map(row => {
		return {
			src: `${igStaticImageRootPath}/${row.hashtag}/${row.image_id}`,
			instaID: row.insta_id
		};
	});

	const renderObject = {
		images: imagesToBeDetected,
		messages: [{
			status: 'status',
			value: `${imagesToBeDetected.length} images on this page. ${pendingImagesCount} remaining`
		}]
	};

	res.render('perform-face-detection', renderObject);
});

router.post('/perform-face-detection', async (req, res) => {
	const formBody = req.body;

	for (const [instaID, rawDetectionData] of Object.entries(formBody)) {
		const detectionData = JSON.parse(rawDetectionData);

		if (detectionData.length) {
			console.log(`Adding data to ${instaID}`);
			await imageQueries.addDetectionDataToImage({instaID, data: rawDetectionData});
		} else {
			console.log(`${instaID} has no faces. Marking as ignored`);
			await imageQueries.markImageAsIgnored(instaID);
		}
	}

	res.redirect('/perform-face-detection');
});

module.exports = router;
