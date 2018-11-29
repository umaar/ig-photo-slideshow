
function createCanvasAndContext({width, height}) {
	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext('2d');

	return {canvas, ctx};
}

export default createCanvasAndContext;
