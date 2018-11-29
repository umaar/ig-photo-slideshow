import serialiseFacesArray from './modules/serialise-faces-array.js';
import drawFaces from './modules/draw-faces.js';
import detectFaces from './modules/detect-faces.js';
import drawImageToCanvas from './modules/draw-image-to-canvas.js';
import computeEyeData from './modules/compute-eye-data.js';
import createCanvasAndContext from './modules/create-canvas-and-context.js';

function annotateForm({instaID, faces = []}) {
	const input = document.querySelector(`form input[name="${instaID}"]`);
	input.value = serialiseFacesArray(faces);
}

async function init() {
	if (!window.FaceDetector) {
		throw new Error('Face Detector is not supported in this browser');
	}

	const allImages = [...document.querySelectorAll('.images-list-image')];

	for (const imageEl of allImages) {
		const scale = 0.3;
		const faces = await detectFaces({img: imageEl});
		const eyeData = computeEyeData(faces);

		const height = Math.round(imageEl.height * scale);
		const width = Math.round(imageEl.width * scale);

		const {canvas, ctx} = createCanvasAndContext({
			width,
			height
		});

		imageEl.parentElement.appendChild(canvas);

		drawImageToCanvas({
			width,
			height,
			img: imageEl,
			scale,
			rotation: eyeData.rotationDifference,
			translationPoint: eyeData.leftEye,
			canvas,
			ctx
		});

		if (!faces.length) {
			canvas.classList.add('images-list-image-no-face-detected');
		}

		drawFaces({ctx, faces, scale, eyeData});

		annotateForm({
			instaID: imageEl.dataset.instaId,
			faces
		});
	}

	const form = document.querySelector('form');
	if (form.querySelector('input[type="text"]')) {
		// Console.log('All images recognised - submitting form!');
		// form.submit();
	}
}

export default init;
