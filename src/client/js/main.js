import thing from './thing.js';
import thing2 from './thing2.js';
import thing3 from './thing3.js';

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
}

window.addEventListener('load', init);

