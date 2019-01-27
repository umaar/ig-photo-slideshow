import drawFaces from './modules/draw-faces.js';
import drawImageToCanvas from './modules/draw-image-to-canvas.js';
import computeEyeData from './modules/compute-eye-data.js';
import createCanvasAndContext from './modules/create-canvas-and-context.js';
import onAudioStep from './modules/on-audio-step.js';

function drawCrosshair({ctx, canvasWidth, canvasHeight}) {
	ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
	ctx.beginPath();
	ctx.moveTo(canvasWidth / 2, 0);
	ctx.lineTo(canvasWidth / 2, canvasHeight);
	ctx.stroke();

	ctx.beginPath();
	ctx.moveTo(0, canvasHeight / 2);
	ctx.lineTo(canvasWidth, canvasHeight / 2);
	ctx.stroke();
}

function init() {
	let runningImageCount = 0;
	let desiredFaceWidth = 300;
	let desiredFaceHeight = 300;
	let faceDirectionChange = -1;

	const minimumImagesCount = 20;
	const canvasWidth = 600;
	const canvasHeight = 600;
	const {canvas, ctx} = createCanvasAndContext({
		width: canvasWidth,
		height: canvasHeight
	});

	let isThereAPendingRequest = false;
	let runningTotal = document.querySelectorAll('.images-list-image').length;
	canvas.classList.add('slideshow-primary-canvas');

	const imageCountEl = document.createElement('p');
	imageCountEl.innerHTML = `You've seen <span>${runningImageCount}</span> faces`;

	document.querySelector('.images-list .container').prepend(canvas);
	document.querySelector('.images-list .container').prepend(imageCountEl);

	function draw() {
		desiredFaceWidth += faceDirectionChange;
		desiredFaceHeight += faceDirectionChange;

		if (desiredFaceWidth === canvasWidth * 0.05) {
			faceDirectionChange = 10;
			console.log('Too small!');
		} else if (desiredFaceWidth === canvasWidth) {
			faceDirectionChange = -10;
			console.log('Too big!');
		}

		ctx.clearRect(0, 0, canvasWidth, canvasHeight);

		const allImageEls = document.querySelectorAll('.images-list-image');
		const imageEl = allImageEls[0];

		if ((allImageEls.length < minimumImagesCount) && !isThereAPendingRequest) {
			isThereAPendingRequest = true;
			const query = new URLSearchParams();
			query.append('offset', runningTotal);
			const url = `${location.origin}${location.pathname}?${query.toString()}`;
			console.log(`${allImageEls.length} images left. Fetching more @ ${url}`);

			fetch(url).then(response => response.text()).then(text => {
				const el = document.createElement('html');
				el.innerHTML = text;
				const newImages = [...el.querySelectorAll('.images-list-image')];
				for (const newImage of newImages) {
					const li = document.createElement('li');
					li.append(newImage);
					document.querySelector('.images-list ul').append(li);
				}

				runningTotal += newImages.length;
				isThereAPendingRequest = false;
			});
			// IsThereAPendingRequest = false;
		}

		if (!imageEl) {
			return;
		}

		const faces = JSON.parse(imageEl.dataset.faceData);

		const scaleFactorForImage = desiredFaceWidth / (faces[0].boundingBox.width);

		const eyeData = computeEyeData(faces);

		const height = Math.round(imageEl.height * scaleFactorForImage);
		const width = Math.round(imageEl.width * scaleFactorForImage);

		if (!width || !height) {
			console.log('Image has invalid dimensions');
			return;
		}

		const translateX = 0;
		const translateY = 0;

		const imagePositionX = canvasWidth / 2 - (eyeData.leftEye.x * scaleFactorForImage);
		const imagePositionY = canvasHeight / 2 - (eyeData.leftEye.y * scaleFactorForImage);
		ctx.save();

		ctx.translate(canvasWidth / 2, canvasHeight / 2);
		ctx.rotate(eyeData.rotationDifference * Math.PI / 180);
		ctx.translate(-canvasWidth / 2, -canvasHeight / 2);

		ctx.drawImage(
			imageEl,
			imagePositionX,
			imagePositionY,
			width,
			height
		);

		ctx.restore();

		drawCrosshair({ctx, canvasWidth, canvasHeight});

		imageEl.parentElement.remove();
		imageCountEl.querySelector('span').innerText = runningImageCount++;
	}

	draw();

	let latestImageTimestamp = Number(new Date());
	let minTimeGapBetweenImages = 60;

	onAudioStep(({isPeak, bars, max}) => {
		const currentTime = Number(new Date());
		const timeElapsed = currentTime - latestImageTimestamp;

		if (isPeak) {
			// If (timeElapsed > minTimeGapBetweenImages) {
			minTimeGapBetweenImages = 250;
			latestImageTimestamp = currentTime;
			draw();
			// } else {
			// 	console.log('Peak too soon, skipping');
			// }
		} else if (timeElapsed > minTimeGapBetweenImages) {
			minTimeGapBetweenImages = 60;
			latestImageTimestamp = currentTime;
			draw();
		}
	});
}

export default init;
