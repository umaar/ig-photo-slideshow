function drawImageToCanvas({width, height, canvas, ctx, img, scale, rotation = 0, translationPoint = {}}) {
	const translateX = translationPoint.x || 0;
	const translateY = translationPoint.y || 0;

	ctx.save();
	ctx.translate(translateX, translateY);
	ctx.rotate(rotation * Math.PI / 180);
	ctx.translate(-translateX, -translateY);
	ctx.drawImage(img, 0, 0, width, height);
	ctx.restore();

	// TODO: make other scripts do this piece
	// img.parentElement.appendChild(canvas);
}

export default drawImageToCanvas;
