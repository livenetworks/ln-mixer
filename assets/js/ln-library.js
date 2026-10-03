import { dispatch, registerDataMapper } from 'ln-ashlar';

const DOM_SELECTOR = 'data-mixer-library';
const DOM_ATTRIBUTE = 'lnLibrary';

if (!window[DOM_ATTRIBUTE]) {

	/* ─── Data mapper (ln-data-coordinator ingress / egress) ──────────
	   The API (api/index.php) returns [{ artist, title, url }] with no id.
	   The coordinator runs every record through ingress() before it reaches
	   the libraryTracks store, so this is where the store key is defined:
	   the audio URL is the track's identity. ──────────────────────────── */

	function _str(value) {
		return typeof value === 'string' ? value.trim() : '';
	}

	registerDataMapper('libraryTracks', {
		ingress: function (raw) {
			const url = _str(raw && raw.url);
			const record = {
				id: url,
				url: url,
				title: _str(raw && raw.title) || url,
				artist: _str(raw && raw.artist)
			};
			if (raw && typeof raw.duration === 'string') record.duration = raw.duration.trim();
			if (raw && typeof raw.durationSec === 'number' && isFinite(raw.durationSec)) record.durationSec = raw.durationSec;
			return record;
		},
		egress: function (record) {
			return record;
		}
	});

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

	/* ─── Component ───────────────────────────────────────────────────
	   Pure data layer for the per-track download UI state (cached /
	   downloading / progress). ln-list owns the rows and re-renders them
	   on every query, so state is kept here by URL and re-applied after
	   each `ln-list:rendered`. ─────────────────────────────────────── */

	function _component(dom) {
		this.dom = dom;
		dom[DOM_ATTRIBUTE] = this;

		this._cached = {};
		this._downloading = {};
		this._progress = {};

		this._bindEvents();

		return this;
	}

	/* ─── Bind Events ─────────────────────────────────────────────── */

	_component.prototype._bindEvents = function () {
		const self = this;

		this.dom.addEventListener('ln-list:rendered', function () {
			self._applyAll();
		});

		this.dom.addEventListener('ln-library:request-mark-cached', function (e) {
			self.markCached(e.detail ? e.detail.cachedUrls : []);
		});

		this.dom.addEventListener('ln-library:request-download-start', function (e) {
			if (!e.detail) return;
			self._downloading[e.detail.url] = true;
			self._progress[e.detail.url] = 0;
			self._applyOne(e.detail.url);
		});

		this.dom.addEventListener('ln-library:request-download-progress', function (e) {
			if (!e.detail) return;
			self._progress[e.detail.url] = Math.round(e.detail.percent);
			self._applyOne(e.detail.url);
		});

		this.dom.addEventListener('ln-library:request-download-done', function (e) {
			if (!e.detail) return;
			const url = e.detail.url;
			delete self._downloading[url];
			if (e.detail.success) {
				self._cached[url] = true;
				self._progress[url] = 100;
			} else {
				delete self._progress[url];
			}
			self._applyOne(url);
		});

		this.dom.addEventListener('ln-library:request-uncache', function (e) {
			if (!e.detail) return;
			delete self._cached[e.detail.url];
			delete self._progress[e.detail.url];
			self._applyOne(e.detail.url);
		});

		this.dom.addEventListener('ln-library:request-clear-all-cached', function () {
			self._cached = {};
			self._progress = {};
			self._applyAll();
		});
	};

	/* ─── Public API (commands) ───────────────────────────────────── */

	_component.prototype.markCached = function (cachedUrls) {
		const cached = {};
		(cachedUrls || []).forEach(function (u) { cached[u] = true; });
		this._cached = cached;
		this._applyAll();
		dispatch(this.dom, 'ln-library:cache-marked', { count: Object.keys(cached).length });
	};

	/* ─── Private: Apply state to rendered rows ───────────────────── */

	_component.prototype._rows = function () {
		return this.dom.querySelectorAll('[data-mixer-library-track]');
	};

	_component.prototype._urlOf = function (li) {
		const btn = li.querySelector('[data-mixer-action="add-to-playlist"]');
		return btn ? btn.getAttribute('data-track-url') : '';
	};

	_component.prototype._applyRow = function (li, url) {
		const bar = li.querySelector('.library-download-progress > [data-ln-progress]');
		const cached = !!this._cached[url];
		const downloading = !!this._downloading[url];

		li.toggleAttribute('data-mixer-cached', cached);
		li.toggleAttribute('data-mixer-downloading', downloading);

		let percent = 0;
		if (cached) percent = 100;
		else if (this._progress[url]) percent = this._progress[url];
		if (bar) bar.setAttribute('data-ln-progress', String(percent));
	};

	_component.prototype._applyOne = function (url) {
		const rows = this._rows();
		for (let i = 0; i < rows.length; i++) {
			if (this._urlOf(rows[i]) === url) {
				this._applyRow(rows[i], url);
				return;
			}
		}
	};

	_component.prototype._applyAll = function () {
		const self = this;
		this._rows().forEach(function (li) {
			self._applyRow(li, self._urlOf(li));
		});
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
