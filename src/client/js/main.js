import performFaceDetection from './perform-face-detection.js';
import viewDetectedFaces from './view-detected-faces.js';
import faceSlideshow from './face-slideshow.js';

function init() {
	if (location.pathname === '/perform-face-detection') {
		performFaceDetection();
	}

	if (location.pathname === '/view-detected-faces') {
		viewDetectedFaces();
	}

	if (location.pathname === '/face-slideshow') {
		faceSlideshow();
	}
}

window.addEventListener('load', init);

