async function detectFaces({img}) {
	const faceDetector = new FaceDetector();
	return await faceDetector.detect(img);
}

export default detectFaces;