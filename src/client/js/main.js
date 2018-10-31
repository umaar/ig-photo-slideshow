import thing from './thing.js';
import thing2 from './thing2.js';
import thing3 from './thing3.js';
import thing4 from './thing4.js';

function init() {
	if (location.pathname === '/perform-face-detection') {
		thing();
	}

	if (location.pathname === '/view-detected-faces') {
		thing2();
	}

	if (location.pathname === '/face-slideshow') {
		thing3();
	}

	if (location.pathname === '/audio-test') {
		thing4();
	}
}

window.addEventListener('load', init);

