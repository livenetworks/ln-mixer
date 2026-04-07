/* ====================================================================
   LN DJ Mixer — Audio Engine
   AudioContext, masterGain, waveform peaks, volume slider
   ==================================================================== */

export function setupAudio(mixer) {

	/* ─── AudioContext + Master Gain ──────────────────────────────── */

	mixer._ensureAudioContext = function () {
		if (this._audioCtx) {
			if (this._audioCtx.state === 'suspended') {
				this._audioCtx.resume();
			}
			return;
		}
		this._audioCtx = new (window.AudioContext || window.webkitAudioContext)();
		this._masterGain = this._audioCtx.createGain();
		this._masterGain.connect(this._audioCtx.destination);

		const slider = this.dom.querySelector('[data-ln-potentiometer="master"]');
		this._masterGain.gain.value = slider ? slider.value / 100 : 0.8;
	};

	mixer._connectDeckAudio = function (deckId) {
		const deckEl = this._getDeck(deckId);
		if (!deckEl) return;
		const audio = deckEl.querySelector('[data-ln-audio]');
		if (!audio || !audio.src) return;

		// Only route through Web Audio API for blob: URLs (same-origin).
		// Cross-origin audio without crossorigin attribute cannot be
		// connected to AudioContext — it would taint the context.
		if (audio.src.indexOf('blob:') !== 0) return;

		this._ensureAudioContext();

		if (!audio._lnSourceNode) {
			audio._lnSourceNode = this._audioCtx.createMediaElementSource(audio);
		}

		try { audio._lnSourceNode.disconnect(); } catch (e) { /* not connected */ }
		audio._lnSourceNode.connect(this._masterGain);
	};

	/* ─── Waveform Peaks — extract from audio blob ───────────────── */

	mixer._extractPeaksFromBlob = function (blob) {
		this._ensureAudioContext();
		const ctx = this._audioCtx;
		const POINTS = 8000;

		return blob.arrayBuffer().then(function (buffer) {
			return ctx.decodeAudioData(buffer);
		}).then(function (audioBuffer) {
			const channels = audioBuffer.numberOfChannels;
			const peaks = [];

			for (let ch = 0; ch < channels; ch++) {
				const raw = audioBuffer.getChannelData(ch);
				const step = Math.max(1, Math.floor(raw.length / POINTS));
				const channelPeaks = new Array(Math.ceil(raw.length / step));

				for (let i = 0, p = 0; i < raw.length; i += step, p++) {
					let max = 0;
					const end = Math.min(i + step, raw.length);
					for (let j = i; j < end; j++) {
						const abs = raw[j] < 0 ? -raw[j] : raw[j];
						if (abs > max) max = abs;
					}
					channelPeaks[p] = Math.round(max * 10000) / 10000;
				}

				peaks.push(channelPeaks);
			}

			return { peaks: peaks, duration: audioBuffer.duration };
		});
	};

	/* ─── Scoped Event Bindings ──────────────────────────────────── */

	mixer._bindAudioWiring = function () {
		const self = this;

		// Settings load after profile ready
		this.dom.addEventListener('ln-profile:ready', function () {
			lnDb.open().then(function () {
				return lnDb.get('settings', 'app');
			}).then(function (record) {
				lnSettings.hydrate(record);
			});
		});

		// Volume slider
		const volumeSlider = this.dom.querySelector('[data-ln-potentiometer="master"]');
		if (volumeSlider) {
			const _handleVolume = function () {
				const val = volumeSlider.value;
				const pct = val + '%';
				volumeSlider.style.background =
					'linear-gradient(to right, hsl(var(--accent)) ' + pct + ', var(--button-bg) ' + pct + ')';
				if (self._masterGain) {
					self._masterGain.gain.value = val / 100;
				}
			};
			volumeSlider.addEventListener('input', _handleVolume);
			_handleVolume();
		}

		// Resume AudioContext on first user gesture
		let _contextResumed = false;
		this.dom.addEventListener('click', function () {
			if (!_contextResumed && self._audioCtx) {
				self._audioCtx.resume();
				_contextResumed = true;
			}
		});
	};

}
