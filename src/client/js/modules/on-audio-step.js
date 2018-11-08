// Thanks https://github.com/victordibia/beats/ !
function findPeaks({pcmdata, samplerate, callback, prevdiffthreshold = 0.3}) {
	var interval = 0.05 * 1000;
	let index = 0;
	var step = Math.round(samplerate * (interval / 1000));
	var max = 0;
	var prevmax = 0;
	//loop through song in time with sample rate
	var samplesound = setInterval(function() {
		if (index >= pcmdata.length) {
			clearInterval(samplesound);
			console.log('✅️ Finished sampling sound')
			return;
		}

		for (var i = index; i < index + step; i++) {
			max = pcmdata[i] > max ? pcmdata[i].toFixed(1) : max;
		}

		// Spot a significant increase? Potential peak
		let bars = getbars(max);

		let isPeak = false;

		if (max - prevmax >= prevdiffthreshold) {
			bars += ' == peak == '
			isPeak = true;
		}

		callback({isPeak, bars, max})

		prevmax = max;
		max = 0;
		index += step;
	}, interval, pcmdata);
}

function getbars(val) {
	let bars = '';

	for (var i = 0; i < val * 50 + 2; i++) {
		bars = bars + '|';
	}

	return bars;
}

async function decodeAudioData({audioCtx, audioData}) {
	return new Promise((resolve, reject) => {
		audioCtx.decodeAudioData(audioData, resolve, reject);
	});
}

function init(callback) {
	if (!callback) {
		throw new Error('No callback supplied to the on audio step module')
	}
	var audioCtx = new window.AudioContext();

	async function getData() {
		const sampleAudioTracks = [{
			url: '/assets/audio/cliches.mp3',
			diffThreshold: 0.4
		}, {
			url: '/assets/audio/fantasia.mp3',
			diffThreshold: 0.3
		}, {
			url: '/assets/audio/lemsip.mp3',
			diffThreshold: 0.5
		}, {
			url: '/assets/audio/ratatat.mp3',
			diffThreshold: 0.3
		}, {
			url: '/assets/audio/pummel.mp3',
			diffThreshold: 0.7
		}, {
			url: '/assets/audio/11h30.mp3',
			diffThreshold: 0.4
		}, {
			url: '/assets/audio/dopebwoy.mp3',
			diffThreshold: 0.3
		}, {
			url: '/assets/audio/pogo.mp3',
			diffThreshold: 0.6
		}, {
			url: '/assets/audio/chain.mp3',
			diffThreshold: 0.4
		}, {
			url: '/assets/audio/clap.m4a',
			diffThreshold: 0.3
		}];

		const randomIndex = Math.floor(Math.random() * sampleAudioTracks.length);
		const audio = sampleAudioTracks[randomIndex];
		const audioURL = audio.url;
		console.log(`Playing ${audioURL}`);
		const response = await fetch(audioURL);  // prevdiffthreshold of 0.3 works well
		const audioData = await response.arrayBuffer();

		const buffer = await decodeAudioData({audioData, audioCtx});
		const source = audioCtx.createBufferSource();

		// source.loop = true;
		source.buffer = buffer;
		source.connect(audioCtx.destination);

		let pcmdata = (buffer.getChannelData(0)) ;
		let samplerate = buffer.sampleRate;

		source.start();

		findPeaks({
			pcmdata,
			samplerate,
			callback,
			prevdiffthreshold: audio.diffThreshold
		});
	}

	getData();
}

export default init;
