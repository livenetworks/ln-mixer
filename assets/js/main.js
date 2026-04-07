// ln-acme components (side-effect imports)
import 'ln-acme/js/ln-toggle/ln-toggle.js';
import 'ln-acme/js/ln-accordion/ln-accordion.js';
import 'ln-acme/js/ln-modal/ln-modal.js';
import 'ln-acme/js/ln-toast/ln-toast.js';
import 'ln-acme/js/ln-search/ln-search.js';
import 'ln-acme/js/ln-sortable/ln-sortable.js';
import 'ln-acme/js/ln-progress/ln-progress.js';

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
