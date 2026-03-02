(function () {
	'use strict';

	var DOM_SELECTOR = 'data-ln-mixer';
	var DOM_ATTRIBUTE = 'lnMixer';

	if (window[DOM_ATTRIBUTE] !== undefined) return;

	/* ─── Constructor ─────────────────────────────────────────────── */

	function constructor(domRoot) {
		_findElements(domRoot);
	}

	function _findElements(root) {
		var items = Array.from(root.querySelectorAll('[' + DOM_SELECTOR + ']'));
		if (root.hasAttribute && root.hasAttribute(DOM_SELECTOR)) {
			items.push(root);
		}
		items.forEach(function (el) {
			if (!el[DOM_ATTRIBUTE]) {
				el[DOM_ATTRIBUTE] = new _component(el);
			}
		});
	}

	/* ─── Component ───────────────────────────────────────────────── */

	function _component(dom) {
		this.dom = dom;
		dom[DOM_ATTRIBUTE] = this;

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

		this._bindScopedEvents();
		this._bindGlobalEvents();
		this._loadProfiles();

		return this;
	}

	/* ─── Export for sub-files ────────────────────────────────────── */

	window._LnMixerComponent = _component;

	/* ─── Init ────────────────────────────────────────────────────── */

	_component.prototype._loadProfiles = function () {
		var self = this;
		lnDb.open().then(function () {
			return lnDb.getAll('profiles');
		}).then(function (profiles) {
			var nav = self._getNav();
			if (nav) {
				nav.dispatchEvent(new CustomEvent('ln-profile:request-hydrate', {
					detail: { profiles: profiles }
				}));
			}
		});
	};

	/* ─── Empty State (coordinator owns UI visibility) ───────────── */

	_component.prototype._updateEmptyState = function () {
		var nav = this._getNav();
		var hasProfiles = nav && nav.lnProfile && Object.keys(nav.lnProfile.profiles).length > 0;

		var emptyState = this.dom.querySelector('[data-ln-empty-state]');
		var decksPanel = this.dom.querySelector('.decks-panel');
		var sidebar = this._getSidebar();

		if (emptyState) emptyState.hidden = hasProfiles;
		if (decksPanel) decksPanel.hidden = !hasProfiles;
		if (sidebar) sidebar.hidden = !hasProfiles;
	};

	/* ─── Child Component Queries (scoped to this.dom) ───────────── */

	_component.prototype._getNav = function () {
		return this.dom.querySelector('[data-ln-profile]');
	};

	_component.prototype._getSidebar = function () {
		return this.dom.querySelector('[data-ln-playlist]');
	};

	_component.prototype._getDeck = function (deckId) {
		return this.dom.querySelector('[data-ln-deck="' + deckId + '"]');
	};

	_component.prototype._getLibraryEl = function () {
		return document.querySelector('[data-ln-library]');
	};

	_component.prototype._refreshDeckHighlights = function () {
		var sidebar = this._getSidebar();
		if (!sidebar) return;

		this.dom.querySelectorAll('[data-ln-deck]').forEach(function (deckEl) {
			var deckId = deckEl.getAttribute('data-ln-deck');
			var idx = (deckEl.lnDeck) ? deckEl.lnDeck.trackIndex : -1;
			sidebar.dispatchEvent(new CustomEvent('ln-playlist:request-highlight', {
				detail: { deckId: deckId, index: idx }
			}));
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

	/* ─── DOM Observer ────────────────────────────────────────────── */

	function _domObserver() {
		var observer = new MutationObserver(function (mutations) {
			mutations.forEach(function (mutation) {
				if (mutation.type === 'childList') {
					mutation.addedNodes.forEach(function (node) {
						if (node.nodeType === 1) {
							_findElements(node);
						}
					});
				}
			});
		});

		observer.observe(document.body, {
			childList: true,
			subtree: true
		});
	}

	/* ─── Init ────────────────────────────────────────────────────── */

	window[DOM_ATTRIBUTE] = constructor;
	_domObserver();

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', function () {
			constructor(document.body);
		});
	} else {
		constructor(document.body);
	}
})();
