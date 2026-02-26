(function () {
	'use strict';

	var DOM_SELECTOR = 'data-ln-library';
	var DOM_ATTRIBUTE = 'lnLibrary';

	if (window[DOM_ATTRIBUTE] !== undefined) return;

	/* ─── Template Helper ─────────────────────────────────────────── */

	var _tmplCache = {};
	function _cloneTemplate(name) {
		if (!_tmplCache[name]) {
			_tmplCache[name] = document.querySelector('[data-ln-template="' + name + '"]');
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

		this._tracks = [];
		this._loaded = false;
		this._loading = false;

		this._list = dom.querySelector('[data-ln-library-list]');
		this._searchInput = dom.querySelector('[data-ln-library-search]');

		this._bindEvents();

		return this;
	}

	/* ─── Bind Events ─────────────────────────────────────────────── */

	_component.prototype._bindEvents = function () {
		var self = this;

		// Search filtering (own DOM concern)
		if (this._searchInput) {
			this._searchInput.addEventListener('input', function () {
				self._filterBySearch(self._searchInput.value);
			});
		}

		// Request events (from coordinator / external code)
		this.dom.addEventListener('ln-library:request-fetch', function () {
			self.fetch();
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

	_component.prototype.fetch = function () {
		if (this._loading) return;

		var apiUrl = window.lnSettings ? lnSettings.getApiUrl() : '';
		if (!apiUrl) {
			_dispatch(this.dom, 'ln-library:error', {
				message: 'API URL not configured'
			});
			return;
		}

		this._loading = true;
		var self = this;

		// Show loading state
		if (this._list) {
			this._list.innerHTML = '';
			var loadingLi = document.createElement('li');
			loadingLi.className = 'library-loading';
			loadingLi.textContent = 'Loading...';
			this._list.appendChild(loadingLi);
		}

		var xhr = new XMLHttpRequest();
		xhr.open('GET', apiUrl);
		xhr.responseType = 'json';

		xhr.onload = function () {
			self._loading = false;
			if (xhr.status >= 200 && xhr.status < 300 && Array.isArray(xhr.response)) {
				self._tracks = xhr.response;
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
			self._showError('Network error');
			_dispatch(self.dom, 'ln-library:error', {
				message: 'Network error'
			});
		};

		xhr.send();
	};

	/* ─── Private: Populate ───────────────────────────────────────── */

	_component.prototype._populate = function () {
		if (!this._list) return;
		this._list.innerHTML = '';

		if (this._tracks.length === 0) {
			var emptyLi = document.createElement('li');
			emptyLi.className = 'library-empty';
			emptyLi.textContent = 'No tracks found';
			this._list.appendChild(emptyLi);
			return;
		}

		var self = this;
		this._tracks.forEach(function (track) {
			self._list.appendChild(self._buildLibraryItem(track));
		});

		// Clear search on fresh populate
		if (this._searchInput) {
			this._searchInput.value = '';
		}
	};

	_component.prototype._buildLibraryItem = function (track) {
		var frag = _cloneTemplate('library-item');
		var li = frag.querySelector('[data-ln-library-track]');

		li.querySelector('.track-name').textContent = track.title;
		li.querySelector('.track-artist').textContent = track.artist;

		// Set data attributes on Add button for coordinator to read
		var addBtn = li.querySelector('[data-ln-action="add-to-playlist"]');
		if (addBtn) {
			addBtn.setAttribute('data-track-title', track.title);
			addBtn.setAttribute('data-track-artist', track.artist);
			if (track.url) {
				addBtn.setAttribute('data-track-url', track.url);
			}
		}

		return li;
	};

	/* ─── Private: Search Filter ──────────────────────────────────── */

	_component.prototype._filterBySearch = function (query) {
		if (!this._list) return;
		var q = query.toLowerCase().trim();
		var items = this._list.querySelectorAll('[data-ln-library-track]');
		items.forEach(function (li) {
			var text = li.textContent.toLowerCase();
			li.hidden = q !== '' && text.indexOf(q) === -1;
		});
	};

	/* ─── Private: Error State ────────────────────────────────────── */

	_component.prototype._showError = function (message) {
		if (!this._list) return;
		this._list.innerHTML = '';
		var errorLi = document.createElement('li');
		errorLi.className = 'library-error';
		errorLi.textContent = message;
		this._list.appendChild(errorLi);
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
