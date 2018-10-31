import onAudioStep from './modules/on-audio-step.js';

function init() {
	onAudioStep(({isPeak, bars, max}) => {
		if (isPeak) {
			console.log('Audio step!', {isPeak, bars, max});
		}
	});
}

export default init;
