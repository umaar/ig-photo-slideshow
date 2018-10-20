
function getLandmarkColour(landmark) {
	const colours = {
		eye: 'yellow',
		nose: 'aqua',
		mouth: 'white',
		'first-eye-point': 'orange'
	};

	return colours[landmark] || 'black';
}

function drawFaces({ctx, faces, scale, eyeData}) {
	const translateX = (eyeData.leftEye ? eyeData.leftEye.x : 0);
	const translateY = (eyeData.leftEye ? eyeData.leftEye.y : 0);

	ctx.save();
	ctx.translate(translateX, translateY);
	ctx.rotate((eyeData.rotationDifference || 0) * Math.PI / 180);
	ctx.translate(-translateX, -translateY);

	for (let face of faces) {
		const faceBoundingBox = face.boundingBox;

		ctx.lineWidth = 2;
		ctx.strokeStyle = 'red';

		ctx.strokeRect(Math.floor(faceBoundingBox.x * scale),
			Math.floor(faceBoundingBox.y * scale),
			Math.floor(faceBoundingBox.width * scale),
			Math.floor(faceBoundingBox.height * scale)
		);
		for (let landmarks of face.landmarks) {
			const landmarkType = landmarks.type;
			const locations = landmarks.locations;
			ctx.lineWidth = 2;
			ctx.strokeStyle = getLandmarkColour(landmarkType);

			let locationIndex = 0;
			for (let location of locations) {
				// TODO: Use eyeData coming in to determine if this location matches the first eye points(s) we received in the drawFaces() function
				if (locationIndex === 0 && landmarkType === 'eye') {
					ctx.strokeStyle = getLandmarkColour('first-eye-point');
				} else {
					ctx.strokeStyle = getLandmarkColour(landmarkType);
				}
				ctx.beginPath();
				ctx.arc(location.x * scale, location.y * scale, 2, 0, 2 * Math.PI);
				ctx.stroke();
				locationIndex++;
			}
		}
	}

	ctx.restore();
}


export default drawFaces;