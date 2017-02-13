/**
 * The *AudioSource object creates an analyzer node, sets up a repeating function with setInterval
 * which samples the input and turns it into an FFT array. The object has two properties:
 * streamData - this is the Uint8Array containing the FFT data
 * volume - cumulative value of all the bins of the streaData.
 *
 * The MicrophoneAudioSource uses the getUserMedia interface to get real-time data from the user's microphone. Not used currently but included for possible future use.
 */

export default class DataSource {
	constructor( options ) {
		this.dataSize = options.dataSize || 2048;
		this.startTime = Date.now();
	}
	update() {}
	onUpdate() {
		this.update();
	}
	stopSampling() {}
	destroy() {}
	get currentTime() {
		return Date.now() - this.startTime;
	}
}
