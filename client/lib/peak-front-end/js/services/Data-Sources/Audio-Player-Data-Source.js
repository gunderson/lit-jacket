/**
 * The *AudioSource object creates an analyzer node, sets up a repeating function with setInterval
 * which samples the input and turns it into an FFT array. The object has two properties:
 * streamData - this is the Uint8Array containing the FFT data
 * volume - cumulative value of all the bins of the streaData.
 *
 * The MicrophoneAudioSource uses the getUserMedia interface to get real-time data from the user's microphone. Not used currently but included for possible future use.
 */

import DataSource from '../Data-Source';
import prefixMethod from '../../utils/prefixmethod';

prefixMethod( 'getUserMedia', {
	parent: navigator
} );
prefixMethod( 'AudioContext' );

export default class AudioPlayerDataSource extends DataSource {
	constructor( player, options ) {
		super();
		this.player = player;
		this.fftsize = 2048;
		this.audioCtx = new window.AudioContext();
		this.analyser = this.audioCtx.createAnalyser();
		this.analyser.fftSize = this.fftsize;
		this.source = this.audioCtx.createMediaElementSource( this.player );
		this.source.connect( this.analyser );
		this.analyser.connect( this.audioCtx.destination );
		this.analyser.smoothingTimeConstant = 0.1;

		this.intervalId = setInterval( this.sampleAudioStream, 1000 / 60 );
		this.streamData = new Uint8Array( this.analyser.frequencyBinCount );
	}

	sampleAudioStream() {
		this.analyser.getByteFrequencyData( this.streamData );
	}

	playStream( streamUrl ) {
		// console.log( streamUrl );
		// get the input stream from the audio element
		this.player.addEventListener( 'ended', function() {
			this.directStream( 'coasting' );
		} );
		this.player.setAttribute( 'src', this.streamUrl );
		this.player.play();
	}
	stopSampling() {
		clearInterval( this.intervalId );
	};

	destroy() {
		this.stopSampling();
		this.source.disconnect();
		this.analyser.disconnect();
	};

	get currentTime() {
		return this.player.currentTime;
	};
}
