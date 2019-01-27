import drawFaces from './modules/draw-faces.js';
import drawImageToCanvas from './modules/draw-image-to-canvas.js';
import computeEyeData from './modules/compute-eye-data.js';
import createCanvasAndContext from './modules/create-canvas-and-context.js';

function init() {
	const allImages = [...document.querySelectorAll('.images-list-image')];

	for (const imageEl of allImages) {
		const scale = 0.2;

		const faces = JSON.parse(imageEl.dataset.faceData);
		const eyeData = computeEyeData(faces);

		const height = Math.round(imageEl.height * scale);
		const width = Math.round(imageEl.width * scale);

		const {canvas, ctx} = createCanvasAndContext({
			width,
			height
		});

		imageEl.parentElement.append(canvas);

		drawImageToCanvas({
			img: imageEl,
			scale,
			rotation: eyeData.rotationDifference,
			translationPoint: eyeData.leftEye,
			width,
			height,
			canvas,
			ctx
		});

		drawFaces({
			ctx,
			faces,
			scale,
			eyeData
		});
	}
}

export default init;
