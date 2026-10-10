import { dispatch, registerComponent, buildDict } from 'ln-ashlar';
import { setupAudio } from './ln-mixer-audio.js';
import { setupCache } from './ln-mixer-cache.js';
import { setupDeck } from './ln-mixer-deck.js';
import { setupSettings } from './ln-mixer-settings.js';
import { setupTransfer } from './ln-mixer-transfer.js';

const DOM_SELECTOR = 'data-mixer';
const DOM_ATTRIBUTE = 'lnMixer';

if (window[DOM_ATTRIBUTE] === undefined) {

	/* ─── Component ───────────────────────────────────────────────── */

	function _component(dom) {
		this.dom = dom;
		dom[DOM_ATTRIBUTE] = this;

		this.dict = buildDict(this.dom, 'data-mixer-dict');

		this._pendingLogo = null;

		// Audio routing
		this._audioCtx = null;
		this._masterGain = null;

		// Audio cache
		this._downloading = {};       // url → true (prevent duplicate downloads)
		this._downloadProgress = {};  // url → { loaded, total } (aggregate progress)
		this._blobUrls = {};          // deckId → blobUrl (for revokeObjectURL cleanup)
		this._fileProtocolWarned = false;

		// Autoplay
		this._autoplay = false;
		this._autoplayTimer = null;
		this._autoplayPreloaded = false;

		setupAudio(this);
		setupCache(this);
		setupDeck(this);
		setupSettings(this);
		setupTransfer(this);

		this._bindScopedEvents();
		this._bindGlobalEvents();
		this._loadProfiles();
		this._updateEmptyState();

		return this;
	}

	/* ─── Init ────────────────────────────────────────────────────── */

	_component.prototype._loadProfiles = function () {
		const self = this;
		lnDb.open().then(function () {
			return lnDb.getAll('profiles');
		}).then(function (profiles) {
			const nav = self._getNav();
			if (nav) {
				dispatch(nav, 'ln-profile:request-hydrate', { profiles: profiles });
			}
		});
	};

	/* ─── Empty State (coordinator owns UI visibility) ───────────── */

	_component.prototype._updateEmptyState = function () {
		const nav = this._getNav();
		const hasProfiles = nav && nav.lnProfile && Object.keys(nav.lnProfile.profiles).length > 0;

		console.log('[ln-mixer] _updateEmptyState called:', {
			navFound: !!nav,
			lnProfileReady: !!(nav && nav.lnProfile),
			profilesCount: (nav && nav.lnProfile && nav.lnProfile.profiles) ? Object.keys(nav.lnProfile.profiles).length : 0,
			hasProfiles: hasProfiles
		});

		const emptyState = this.dom.querySelector('[data-mixer-empty-state]');
		const decksPanel = this.dom.querySelector('.decks-panel');
		const sidebar = this._getSidebar();

		if (emptyState) {
			emptyState.hidden = hasProfiles;
			console.log('[ln-mixer] emptyState hidden set to:', hasProfiles);
		}
		if (decksPanel) decksPanel.hidden = !hasProfiles;
		if (sidebar) sidebar.hidden = !hasProfiles;
	};

	/* ─── Child Component Queries (scoped to this.dom) ───────────── */

	_component.prototype._getNav = function () {
		return this.dom.querySelector('[data-mixer-profile]');
	};

	_component.prototype._getSidebar = function () {
		return this.dom.querySelector('[data-mixer-playlist]');
	};

	_component.prototype._getDeck = function (deckId) {
		return this.dom.querySelector('[data-mixer-deck="' + deckId + '"]');
	};

	_component.prototype._getLibraryEl = function () {
		return document.querySelector('[data-mixer-library]');
	};

	_component.prototype._refreshDeckHighlights = function () {
		const sidebar = this._getSidebar();
		if (!sidebar) return;

		this.dom.querySelectorAll('[data-mixer-deck]').forEach(function (deckEl) {
			const deckId = deckEl.getAttribute('data-mixer-deck');
			const idx = (deckEl.lnDeck) ? deckEl.lnDeck.trackIndex : -1;
			dispatch(sidebar, 'ln-playlist:request-highlight', { deckId: deckId, index: idx });
		});
	};

	/* ─── Event Dispatch Hubs ────────────────────────────────────── */

	_component.prototype._bindScopedEvents = function () {
		this._bindProfileBridge();
		this._bindDeckWiring();
		this._bindLoopWiring();
		this._bindAudioWiring();
	};

	_component.prototype._bindGlobalEvents = function () {
		this._bindAutoplayToggle();
		this._bindProfileActions();
		this._bindPlaylistActions();
		this._bindLoopActions();
		this._bindLibraryReactions();
		this._bindCacheActions();
		this._bindSettingsActions();
		this._bindTransferActions();
	};

	/* ─── Init ────────────────────────────────────────────────────── */

	registerComponent(DOM_SELECTOR, DOM_ATTRIBUTE, _component, 'ln-mixer');

}
