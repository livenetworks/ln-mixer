// Project entry — loaded as a native ES module AFTER assets/js/ln-ashlar.build.js
// (the vendor bundle, loaded via its own <script> tag in index.html).
//
// These project files are intentionally NOT bundled or minified: this is a demo
// of how to work with ln-ashlar, so each component stays a separate, readable
// file. Bare-specifier imports inside them ('ln-ashlar' → the built vendor bundle,
// 'wavesurfer.js') resolve at runtime via the <script type="importmap"> in index.html.
// 'ln-ashlar' maps to assets/js/ln-ashlar.build.js, which re-exports the ln-core
// helpers — so production never fetches the ln-ashlar submodule (dev-only build source).

// Mixer components (side-effect imports, order matters)
import './ln-db.js';
import './ln-profile.js';
import './ln-playlist.js';
import './ln-settings.js';
import './ln-library.js';
import './ln-waveform.js';
import './ln-deck.js';
import './ln-mixer.js';
import './ln-mixer-audio.js';
import './ln-mixer-cache.js';
import './ln-mixer-deck.js';
import './ln-mixer-settings.js';
import './ln-mixer-transfer.js';

// Global form submit handler (moved from inline script)
document.addEventListener('submit', function (e) {
	e.preventDefault();
	const form = e.target;
	if (form.hasAttribute('data-ln-form')) {
		form.dispatchEvent(new CustomEvent('ln-form:submit', {
			bubbles: true,
			detail: { form: form }
		}));
	}
}, true);

// Service Worker registration (moved from inline script)
if ('serviceWorker' in navigator) {
	navigator.serviceWorker.register('./sw.js');
}


