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
		this._search = dom.querySelector('[data-ln-search]');

		this._bindEvents();

		return this;
	}

	/* ─── Bind Events ─────────────────────────────────────────────── */

	_component.prototype._bindEvents = function () {
		var self = this;

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

	_component.prototype.markCached = function (cachedUrls) {
		if (!this._list) return;
		var urlSet = {};
		cachedUrls.forEach(function (u) { urlSet[u] = true; });

		var items = this._list.querySelectorAll('[data-ln-library-track]');
		items.forEach(function (li) {
			var addBtn = li.querySelector('[data-ln-action="add-to-playlist"]');
			var url = addBtn ? addBtn.getAttribute('data-track-url') : '';
			var bar = li.querySelector('[data-ln-progress]');
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
		var items = this._list.querySelectorAll('[data-ln-library-track]');
		for (var i = 0; i < items.length; i++) {
			var btn = items[i].querySelector('[data-ln-action="add-to-playlist"]');
			if (btn && btn.getAttribute('data-track-url') === url) {
				return items[i];
			}
		}
		return null;
	};

	_component.prototype._setDownloading = function (url, active) {
		var li = this._findItemByUrl(url);
		if (!li) return;
		if (active) {
			li.setAttribute('data-ln-downloading', '');
			var bar = li.querySelector('[data-ln-progress]');
			if (bar) bar.setAttribute('data-ln-progress', '0');
		} else {
			li.removeAttribute('data-ln-downloading');
		}
	};

	_component.prototype._updateProgress = function (url, percent) {
		var li = this._findItemByUrl(url);
		if (!li) return;
		var bar = li.querySelector('[data-ln-progress]');
		if (bar) bar.setAttribute('data-ln-progress', String(Math.round(percent)));
	};

	_component.prototype._markSingleCached = function (url) {
		var li = this._findItemByUrl(url);
		if (!li) return;
		li.setAttribute('data-ln-cached', '');
		var bar = li.querySelector('[data-ln-progress]');
		if (bar) bar.setAttribute('data-ln-progress', '100');
	};

	_component.prototype._markSingleUncached = function (url) {
		var li = this._findItemByUrl(url);
		if (!li) return;
		li.removeAttribute('data-ln-cached');
		var bar = li.querySelector('[data-ln-progress]');
		if (bar) bar.setAttribute('data-ln-progress', '0');
	};

	_component.prototype._clearAllCached = function () {
		if (!this._list) return;
		var items = this._list.querySelectorAll('[data-ln-cached]');
		items.forEach(function (li) {
			li.removeAttribute('data-ln-cached');
			var bar = li.querySelector('[data-ln-progress]');
			if (bar) bar.setAttribute('data-ln-progress', '0');
		});
	};

	/* ─── Private: Populate ───────────────────────────────────────── */

	_component.prototype._populate = function () {
		if (!this._list) return;
		this._list.innerHTML = '';
		if (this._search) this._search.hidden = false;

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

		// Clear ln-search on fresh populate
		var searchEl = this.dom.querySelector('[data-ln-search]');
		if (searchEl && searchEl.lnSearch) {
			searchEl.lnSearch.clear();
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

	/* ─── Private: Error State ────────────────────────────────────── */

	_component.prototype._showError = function (message) {
		if (!this._list) return;
		this._list.innerHTML = '';
		var errorLi = document.createElement('li');
		errorLi.className = 'library-error';
		errorLi.textContent = message;
		this._list.appendChild(errorLi);
	};

	_component.prototype._showNoApi = function () {
		if (!this._list) return;
		this._list.innerHTML = '';
		if (this._search) this._search.hidden = true;

		var li = document.createElement('li');
		li.className = 'library-no-api';

		var icon = document.createElement('figure');
		icon.className = 'library-no-api-icon';
		var span = document.createElement('span');
		span.className = 'ln-icon-settings';
		icon.appendChild(span);

		var title = document.createElement('h3');
		title.textContent = 'No API configured';

		var desc = document.createElement('p');
		desc.textContent = 'Set the Library API URL in Settings to load tracks.';

		var btn = document.createElement('button');
		btn.type = 'button';
		btn.className = 'library-no-api-btn';
		btn.setAttribute('data-ln-action', 'open-settings-from-library');
		var btnIcon = document.createElement('span');
		btnIcon.className = 'ln-icon-settings ln-icon--sm';
		var btnLabel = document.createElement('span');
		btnLabel.className = 'label';
		btnLabel.textContent = 'Open Settings';
		btn.appendChild(btnIcon);
		btn.appendChild(btnLabel);

		li.appendChild(icon);
		li.appendChild(title);
		li.appendChild(desc);
		li.appendChild(btn);
		this._list.appendChild(li);
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
