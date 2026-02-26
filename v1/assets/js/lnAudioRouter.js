(function () {
	const DOM_ATTRIBUTE = "lnAudioRouter";

	if (window[DOM_ATTRIBUTE]) return;

	let audioContext = null;
	let masterGain = null;
	const deckGains = {};
	const deckSources = {};

	function _ensureContext() {
		if (audioContext) {
			if (audioContext.state === "suspended") {
				audioContext.resume();
			}
			return;
		}

		audioContext = new (window.AudioContext || window.webkitAudioContext)();
		masterGain = audioContext.createGain();
		masterGain.gain.value = 0.8; // Match default slider value of 80
		masterGain.connect(audioContext.destination);

		// Create gain nodes for each deck
		["A", "B"].forEach(function (deck) {
			deckGains[deck] = audioContext.createGain();
			deckGains[deck].connect(masterGain);
		});

		// Apply initial crossfade (50 = center = equal)
		_setCrossfade(50);

		console.log("🔊 AudioContext created");
	}

	function _connectDeck(deckId, audioElement) {
		_ensureContext();

		// MediaElementAudioSourceNode can only be created once per audio element
		if (!audioElement._lnSourceNode) {
			audioElement._lnSourceNode = audioContext.createMediaElementSource(audioElement);
		}

		// Disconnect from any previous destination
		try {
			audioElement._lnSourceNode.disconnect();
		} catch (e) {
			// Not connected yet, that's fine
		}

		// Connect to this deck's gain node
		if (deckGains[deckId]) {
			audioElement._lnSourceNode.connect(deckGains[deckId]);
			deckSources[deckId] = audioElement._lnSourceNode;
			console.log("🔗 Deck " + deckId + " connected to audio router");
		}
	}

	function _setMasterVolume(value) {
		_ensureContext();
		// value: 0-100
		masterGain.gain.value = value / 100;
	}

	function _setCrossfade(value) {
		if (!audioContext) return;
		// value: 0-100, 0=full A, 100=full B, 50=equal
		var position = value / 100;
		// Equal power crossfade
		deckGains["A"].gain.value = Math.cos(position * Math.PI / 2);
		deckGains["B"].gain.value = Math.sin(position * Math.PI / 2);
	}

	// Listen for deck:loaded to connect audio elements
	document.addEventListener("ln-deck:loaded", function (e) {
		var deckId = e.detail?.deck;
		if (!deckId) return;

		var deckEl = document.querySelector('[data-ln-deck="' + deckId + '"]');
		if (!deckEl) return;

		var audio = deckEl.querySelector("audio");
		if (!audio) return;

		_connectDeck(deckId, audio);
	});

	// Listen for potentiometer changes
	document.addEventListener("ln-potentiometer:change", function (e) {
		var name = e.detail?.name;
		var value = e.detail?.value;

		if (name === "master") {
			_setMasterVolume(value);
		} else if (name === "crossfader") {
			_setCrossfade(value);
		}
	});

	// Public API
	window[DOM_ATTRIBUTE] = {
		ensureContext: _ensureContext,
		connectDeck: _connectDeck,
		setMasterVolume: _setMasterVolume,
		setCrossfade: _setCrossfade,
		getContext: function () { return audioContext; },
		getDeckGain: function (deck) { return deckGains[deck]; }
	};
})();
