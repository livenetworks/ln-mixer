const DOM_SELECTOR = 'data-ln-library';
const DOM_ATTRIBUTE = 'lnLibrary';

if (!window[DOM_ATTRIBUTE]) {

	/* ─── Template Helper ─────────────────────────────────────────── */

	const _tmplCache = {};
	function _cloneTemplate(name) {
		if (!_tmplCache[name]) {
			_tmplCache[name] = document.querySelector('[data-ln-template="' + name + '"]');
		}
		if (!_tmplCache[name]) {
			console.warn('ln-library: template "' + name + '" not found');
			return document.createDocumentFragment();
		}
		return _tmplCache[name].content.cloneNode(true);
	}

	/* ─── Helpers ──────────────────────────────────────────────────── */

	function _dispatch(element, eventName, detail) {
		element.dispatchEvent(new CustomEvent(eventName, {
			bubbles: true,
			detail: detail || {}
		}));
	}

	function _validateTrack(raw, index) {
		if (!raw || typeof raw !== 'object') {
			console.warn('ln-library: skipping track[' + index + '] — not an object');
			return null;
		}
		var url = typeof raw.url === 'string' ? raw.url.trim() : '';
		var title = typeof raw.title === 'string' ? raw.title.trim() : '';
		if (!url) {
			console.warn('ln-library: skipping track[' + index + '] — missing url');
			return null;
		}
		if (!title) {
			console.warn('ln-library: skipping track[' + index + '] — missing title');
			return null;
		}
		var validated = { url: url, title: title };
		validated.artist = typeof raw.artist === 'string' ? raw.artist.trim() : '';
		if (typeof raw.duration === 'string') validated.duration = raw.duration.trim();
		if (typeof raw.durationSec === 'number' && isFinite(raw.durationSec)) validated.durationSec = raw.durationSec;
		return validated;
	}

	/* ─── Constructor ─────────────────────────────────────────────── */

	function constructor(domRoot) {
		_findElements(domRoot);
	}

	function _findElements(root) {
		const items = Array.from(root.querySelectorAll('[' + DOM_SELECTOR + ']'));
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

		this._tracks = [];
		this._loaded = false;
		this._loading = false;

		this._list = dom.querySelector('[data-ln-library-list]');
		this._noApi = dom.querySelector('[data-ln-library-no-api]');
		this._search = dom.querySelector('[data-ln-search]');

		this._bindEvents();

		return this;
	}

	/* ─── Bind Events ─────────────────────────────────────────────── */

	_component.prototype._bindEvents = function () {
		const self = this;

		// Request events (from coordinator / external code)
		this.dom.addEventListener('ln-library:request-fetch', function (e) {
			self.fetch(e.detail ? e.detail.apiUrl : '');
		});

		this.dom.addEventListener('ln-library:request-mark-cached', function (e) {
			self.markCached(e.detail ? e.detail.cachedUrls : []);
		});

		this.dom.addEventListener('ln-library:request-download-start', function (e) {
			if (e.detail) self._setDownloading(e.detail.url, true);
		});

		this.dom.addEventListener('ln-library:request-download-progress', function (e) {
			if (e.detail) self._updateProgress(e.detail.url, e.detail.percent);
		});

		this.dom.addEventListener('ln-library:request-download-done', function (e) {
			if (!e.detail) return;
			self._setDownloading(e.detail.url, false);
			if (e.detail.success) {
				self._markSingleCached(e.detail.url);
			}
		});

		this.dom.addEventListener('ln-library:request-uncache', function (e) {
			if (e.detail) self._markSingleUncached(e.detail.url);
		});

		this.dom.addEventListener('ln-library:request-clear-all-cached', function () {
			self._clearAllCached();
		});
	};

	/* ─── Public API (queries) ────────────────────────────────────── */

	_component.prototype.getTracks = function () {
		return this._tracks;
	};

	_component.prototype.isLoaded = function () {
		return this._loaded;
	};

	/* ─── Public API (commands) ───────────────────────────────────── */

	_component.prototype.fetch = function (apiUrl) {
		if (this._loading) return;

		if (!apiUrl) {
			this._showNoApi();
			return;
		}

		this._loading = true;
		this._hideNoApi();
		const self = this;

		// Abort previous request if still in-flight
		if (this._xhr) { this._xhr.abort(); this._xhr = null; }

		// Show loading state
		if (this._list) {
			this._list.innerHTML = '';
			const loadingLi = document.createElement('li');
			loadingLi.className = 'library-loading';
			loadingLi.textContent = 'Loading...';
			this._list.appendChild(loadingLi);
		}

		const xhr = this._xhr = new XMLHttpRequest();
		xhr.open('GET', apiUrl);
		xhr.responseType = 'json';

		xhr.onload = function () {
			self._loading = false;
			self._xhr = null;
			if (xhr.status >= 200 && xhr.status < 300 && Array.isArray(xhr.response)) {
				var valid = [];
				var skipped = 0;
				for (var i = 0; i < xhr.response.length; i++) {
					var t = _validateTrack(xhr.response[i], i);
					if (t) valid.push(t);
					else skipped++;
				}
				if (skipped > 0) console.warn('ln-library: skipped ' + skipped + ' invalid track(s)');
				self._tracks = valid;
				self._loaded = true;
				self._populate();
				_dispatch(self.dom, 'ln-library:fetched', {
					count: self._tracks.length
				});
			} else {
				self._showError('Failed to load tracks');
				_dispatch(self.dom, 'ln-library:error', {
					message: 'HTTP ' + xhr.status
				});
			}
		};

		xhr.onerror = function () {
			self._loading = false;
			self._xhr = null;
			self._showError('Network error');
			_dispatch(self.dom, 'ln-library:error', {
				message: 'Network error'
			});
		};

		xhr.send();
	};

	_component.prototype.markCached = function (cachedUrls) {
		if (!this._list) return;
		const urlSet = {};
		cachedUrls.forEach(function (u) { urlSet[u] = true; });

		const items = this._list.querySelectorAll('[data-ln-library-track]');
		items.forEach(function (li) {
			const addBtn = li.querySelector('[data-ln-action="add-to-playlist"]');
			const url = addBtn ? addBtn.getAttribute('data-track-url') : '';
			const bar = li.querySelector('.library-download-progress > [data-ln-progress]');
			if (url && urlSet[url]) {
				li.setAttribute('data-ln-cached', '');
				if (bar) bar.setAttribute('data-ln-progress', '100');
			} else {
				li.removeAttribute('data-ln-cached');
				if (bar) bar.setAttribute('data-ln-progress', '0');
			}
		});
	};

	/* ─── Private: Download UI ───────────────────────────────────── */

	_component.prototype._findItemByUrl = function (url) {
		if (!this._list) return null;
		const items = this._list.querySelectorAll('[data-ln-library-track]');
		for (let i = 0; i < items.length; i++) {
			const btn = items[i].querySelector('[data-ln-action="add-to-playlist"]');
			if (btn && btn.getAttribute('data-track-url') === url) {
				return items[i];
			}
		}
		return null;
	};

	_component.prototype._setDownloading = function (url, active) {
		const li = this._findItemByUrl(url);
		if (!li) return;
		if (active) {
			li.setAttribute('data-ln-downloading', '');
			const bar = li.querySelector('.library-download-progress > [data-ln-progress]');
			if (bar) bar.setAttribute('data-ln-progress', '0');
		} else {
			li.removeAttribute('data-ln-downloading');
		}
	};

	_component.prototype._updateProgress = function (url, percent) {
		const li = this._findItemByUrl(url);
		if (!li) return;
		const bar = li.querySelector('.library-download-progress > [data-ln-progress]');
		if (bar) bar.setAttribute('data-ln-progress', String(Math.round(percent)));
	};

	_component.prototype._markSingleCached = function (url) {
		const li = this._findItemByUrl(url);
		if (!li) return;
		li.setAttribute('data-ln-cached', '');
		const bar = li.querySelector('.library-download-progress > [data-ln-progress]');
		if (bar) bar.setAttribute('data-ln-progress', '100');
	};

	_component.prototype._markSingleUncached = function (url) {
		const li = this._findItemByUrl(url);
		if (!li) return;
		li.removeAttribute('data-ln-cached');
		const bar = li.querySelector('.library-download-progress > [data-ln-progress]');
		if (bar) bar.setAttribute('data-ln-progress', '0');
	};

	_component.prototype._clearAllCached = function () {
		if (!this._list) return;
		const items = this._list.querySelectorAll('[data-ln-cached]');
		items.forEach(function (li) {
			li.removeAttribute('data-ln-cached');
			const bar = li.querySelector('.library-download-progress > [data-ln-progress]');
			if (bar) bar.setAttribute('data-ln-progress', '0');
		});
	};

	/* ─── Private: Populate ───────────────────────────────────────── */

	_component.prototype._buildLibraryItem = function (track) {
		const frag = _cloneTemplate('library-item');
		const li = frag.querySelector('[data-ln-library-track]');

		var nameEl = li.querySelector('.track-name');
		var artistEl = li.querySelector('.track-artist');
		if (nameEl) nameEl.textContent = track.title;
		if (artistEl) artistEl.textContent = track.artist;

		// Set data attributes on Add button for coordinator to read
		const addBtn = li.querySelector('[data-ln-action="add-to-playlist"]');
		if (addBtn) {
			addBtn.setAttribute('data-track-title', track.title);
			addBtn.setAttribute('data-track-artist', track.artist);
			if (track.url) {
				addBtn.setAttribute('data-track-url', track.url);
			}
		}

		return li;
	};

	_component.prototype._populate = function () {
		if (!this._list) return;
		this._list.innerHTML = '';
		if (this._search) this._search.hidden = false;

		if (this._tracks.length === 0) {
			const emptyLi = document.createElement('li');
			emptyLi.className = 'library-empty';
			emptyLi.textContent = 'No tracks found';
			this._list.appendChild(emptyLi);
			return;
		}

		const self = this;
		this._tracks.forEach(function (track) {
			self._list.appendChild(self._buildLibraryItem(track));
		});

		// Ensure ln-progress instances are initialized on newly added bars
		if (window.lnProgress) {
			window.lnProgress(this._list);
		}

		// Clear ln-search on fresh populate
		const searchEl = this.dom.querySelector('[data-ln-search]');
		if (searchEl && searchEl.lnSearch) {
			searchEl.lnSearch.clear();
		}
	};

	/* ─── Private: Error State ────────────────────────────────────── */

	_component.prototype._showError = function (message) {
		if (!this._list) return;
		this._list.innerHTML = '';
		const errorLi = document.createElement('li');
		errorLi.className = 'library-error';
		errorLi.textContent = message;
		this._list.appendChild(errorLi);
	};

	_component.prototype._showNoApi = function () {
		if (this._noApi) this._noApi.hidden = false;
		if (this._list) this._list.hidden = true;
		if (this._search) this._search.hidden = true;
	};

	_component.prototype._hideNoApi = function () {
		if (this._noApi) this._noApi.hidden = true;
		if (this._list) this._list.hidden = false;
	};

	/* ─── DOM Observer ────────────────────────────────────────────── */

	function _domObserver() {
		const observer = new MutationObserver(function (mutations) {
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

}
