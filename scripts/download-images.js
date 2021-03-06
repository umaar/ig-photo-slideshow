const path = require('path');
const fs = require('fs');
const URL = require('url');
const got = require('got');
const puppeteer = require('puppeteer');
const config = require('config');

const downloadDirectory = config.get('downloadDirectories')[0].path;
const providerURLFirstParts = config.get('providerURL').join('');
const pagesToScrollDuringDownloading = config.get('pagesToScrollDuringDownloading');

const hashtag = 'selfie';
const IGFeedURL = `${providerURLFirstParts}ram.com/explore/tags/${hashtag}/`;

console.log(`Using URL: ${IGFeedURL}`);

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

function getLargestIGImageData(arr) {
	const url = arr.reduce((prev, cur, ind) => {
		const previousDimensions = prev.config_height + prev.config_width;
		const currentDimensions = cur.config_height + cur.config_width;

		if (currentDimensions > previousDimensions) {
			return cur;
		}

		return prev;
	}).src;

	return url;
}

async function start() {
	const setOfExistingDownloadedImagesIDs = new Set();
	const newIGPostIDs = new Set();
	let directoryListing;
	let errorCount = 0;

	try {
		directoryListing = fs.readdirSync(downloadDirectory);
	} catch (error) {
		throw new Error('Error reading existing image directory');
		console.log({error}, '\n');
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
		const {pathname} = URL.parse(request.url());
		if (pathname.endsWith('.jpg')) {
			// No need to waste bandwidth and download images at this point
			request.abort();
		} else {
			request.continue();
		}
	});

	await page.goto(IGFeedURL);

	for (let currentPage = 0; currentPage < pagesToScrollDuringDownloading; currentPage++) {
		// Do this on each 'page' of the inifite scroll as IG appears to hide some posts when out the viewport
		const postsSelector = '[href*="/p/"]';
		const currentPosts = await page.$$(postsSelector);

		if (!currentPosts.length) {
			await closeBrowser();
			throw new Error(`Couldn't find posts by selector ( ${postsSelector} )`);
		}

		for (const post of currentPosts) {
			const href = await (await post.getProperty('href')).jsonValue();
			const IGPostID = href.split('/')[4];
			newIGPostIDs.add(IGPostID);
		}

		console.log(`Scrolling to page ${currentPage}. There are ${newIGPostIDs.size} posts so far`);

		await sleep(600);
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
		} catch (error) {
			errorCount++;
			console.log(`Error fetching IG JSON. Error count: ${errorCount}`, {error});
			continue;
		}

		const APIRawResponse = response ? response.body : null;

		if (!APIRawResponse) {
			throw new Error('Couldn\'t fetch response body');
		}

		const IGPostData = APIRawResponse.graphql.shortcode_media.display_resources;

		const postImageURL = getLargestIGImageData(IGPostData);

		const downloadLocation = `${downloadDirectory}/${IGPostID}--${path.basename(postImageURL.split('?')[0])}`;
		console.log(`Downloading ${postImageURL} to ${downloadLocation} (${++downloadedImageCount}/${newIGPostIDs.size})`);

		console.log(`\n${downloadLocation}\n`);
		try {
			const downloadResponse = await got(postImageURL, {
				encoding: null
			});

			fs.writeFileSync(downloadLocation, downloadResponse.body, 'binary');
		} catch (error) {
			errorCount++;
			console.log('Error downloading and writing image to disk', {error}, '\n');
			continue;
		}
	}

	console.log(`\nFinished downloading images. There were ${errorCount} errors. Exiting...`);
}

start();
