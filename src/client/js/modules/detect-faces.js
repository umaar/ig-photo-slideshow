async function detectFaces({img}) {
	const faceDetector = new FaceDetector({fastMode: false, maxDetectedFaces: 1});
	return await faceDetector.detect(img);
}

export default detectFaces;
