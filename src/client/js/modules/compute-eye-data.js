function compute(data) {
	if (!data || !data.length) {
		return {};
	}

	const [[leftEye], [rightEye]] = data[0]
		.landmarks
		.filter(({type}) => type === 'eye')
		.map(({locations}) => locations);

	return {
		rotationDifference: -differenceBetweenPointsInDegrees(leftEye, rightEye),
		leftEye,
		rightEye
	};
}

function differenceBetweenPointsInDegrees(p1, p2) {
	return Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
}

export default compute;
