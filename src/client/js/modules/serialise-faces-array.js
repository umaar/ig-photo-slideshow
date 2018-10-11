
function serialiseFacesArray(input) {
	const faces = input.map(face => {
		return {
			landmarks: face.landmarks,
			boundingBox: face.boundingBox
		};
	});

	return JSON.stringify(faces);
}

export default serialiseFacesArray;