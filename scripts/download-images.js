const path = require('path');
const fs = require('fs');
const got = require('got');
const puppeteer = require('puppeteer');
const config = require('config');

const downloadDirectory = config.get('downloadsDirectory');
const providerURLFirstParts = config.get('providerURL').join('');
const pagesToScroll = 2;

const hashtag = 'selfie';
const IGFeedURL = `${providerURLFirstParts}ram.com/explore/tags/${hashtag}/`;

console.log(`Using URL: ${IGFeedURL}`);

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

function getLargestIGImageData(arr) {
	return arr.reduce((prev, cur, ind) => {
		const previousDimensions = prev.config_height + prev.config_width;
		const currentDimensions = cur.config_height + cur.config_width;

		if (currentDimensions > previousDimensions) {
			return cur;
		}
		return prev;
	}).src;
}

async function start() {
	const setOfExistingDownloadedImagesIDs = new Set();
	const newIGPostIDs = new Set();
	let directoryListing;
	let errorCount = 0;

	try {
		directoryListing = fs.readdirSync(downloadDirectory);
	} catch (err) {
		console.log({err});
		throw new Error('Error reading existing image directory');
	}

	const existingImageFileNames = directoryListing
		.filter(file => file.endsWith('.jpg'))
		.map(file => file.split('--')[0]);

	existingImageFileNames.forEach(fileName => setOfExistingDownloadedImagesIDs.add(fileName));

	console.log(`Found ${setOfExistingDownloadedImagesIDs.size} already downloaded IG images`);

	let downloadedImageCount = 0;
	const browser = await puppeteer.launch({
		headless: false
	});

	async function closeBrowser() {
		await browser.close();
	}

	const page = await browser.newPage();

	await page.setRequestInterception(true);

	page.on('request', request => {
		const url = request.url();
		// No need to waste bandwidth and download images
		if (url.endsWith('.jpg')) {
			request.abort();
		} else {
			request.continue();
		}
	});

	await page.goto(IGFeedURL);

	for (let currentPage = 0; currentPage < pagesToScroll; currentPage++) {
		// Do this on each 'page' of the inifite scroll as IG appears to hide some posts when out the viewport
		const currentPosts = await page.$$('[href*="/p/"]');

		if (!currentPosts.length) {
			await closeBrowser();
			throw new Error('Couldn\'t find posts by selector');
		}

		for (const el of currentPosts) {
			const href = await (await el.getProperty('href')).jsonValue();
			const IGPostID = href.split('/')[4];
			newIGPostIDs.add(IGPostID);
		}

		console.log(`Scrolling to page ${currentPage}. There are ${newIGPostIDs.size} posts so far`);

		await sleep(500);
		await page.evaluate(
		  'window.scrollTo(0, document.body.scrollHeight)'
		);
	}

	await closeBrowser();

	console.log(`Found a total of ${newIGPostIDs.size} posts`);

	for (const IGPostID of newIGPostIDs) {
		if (errorCount > 100) {
			throw new Error(`There have been too many (${errorCount}) errors. Exiting.`);
		}
		if (setOfExistingDownloadedImagesIDs.has(IGPostID)) {
			console.log(`Skipping ${IGPostID} as it has already been downloaded`);
			continue;
		}

		const IGPostAPIURL = `${providerURLFirstParts}ram.com/p/${IGPostID}/?__a=1`;

		let response;

		try {
			response = await got(IGPostAPIURL, {
				json: true
			});
		} catch (err) {
			errorCount++;
			console.log(`Error fetching IG JSON. Error count: ${errorCount}`, {err});
			continue;
		}

		const APIRawResponse = response ? response.body : null;

		if (!APIRawResponse) {
			throw new Error('Couldn\'t fetch response body');
		}

		const IGPostData = APIRawResponse.graphql.shortcode_media.display_resources;

		const postImageURL = getLargestIGImageData(IGPostData);

		const downloadLocation = `${downloadDirectory}/${IGPostID}--${path.basename(postImageURL)}`;
		console.log(`Downloading ${postImageURL} to ${downloadLocation} (${++downloadedImageCount})`);

		try {
			const downloadResponse = await got(postImageURL, {
				encoding: null
			});

			fs.writeFileSync(downloadLocation, downloadResponse.body, 'binary');
		} catch (err) {
			errorCount++;
			console.log('Error downloading and writing image to disk', {err});
			continue;
		}
	}

	console.log(`Finished downloading images. There were ${errorCount} errors. Exiting...`);

	await sleep(2000);
}

start();
