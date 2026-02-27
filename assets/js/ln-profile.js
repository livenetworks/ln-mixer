(function () {
	'use strict';

	var DOM_SELECTOR = 'data-ln-profile';
	var DOM_ATTRIBUTE = 'lnProfile';

	if (window[DOM_ATTRIBUTE] !== undefined) return;

	/* ─── Helpers ──────────────────────────────────────────────────── */

	function _dispatch(element, eventName, detail) {
		element.dispatchEvent(new CustomEvent(eventName, {
			bubbles: true,
			detail: detail || {}
		}));
	}

	function _generateId(name) {
		var id = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
		if (!id) id = 'profile';
		return id;
	}

	function _uniqueId(base, existing) {
		if (!existing[base]) return base;
		var counter = 2;
		while (existing[base + '-' + counter]) counter++;
		return base + '-' + counter;
	}

	/* ─── Template Helper ─────────────────────────────────────────── */

	var _tmplCache = {};
	function _cloneTemplate(name) {
		if (!_tmplCache[name]) {
			_tmplCache[name] = document.querySelector('[data-ln-template="' + name + '"]');
		}
		return _tmplCache[name].content.cloneNode(true);
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

		this.profiles = {};
		this.currentId = null;

		this.addBtn = dom.querySelector('[data-ln-action="new-profile"]');
		this.emptyState = document.querySelector('[data-ln-empty-state]');
		this.decksPanel = document.querySelector('.decks-panel');
		this.sidebar = document.querySelector('.sidebar');

		this._bindEvents();

		return this;
	}

	/* ─── Bind Events ─────────────────────────────────────────────── */

	_component.prototype._bindEvents = function () {
		var self = this;

		// Click delegation on nav for profile switching (own buttons only)
		this.dom.addEventListener('click', function (e) {
			var btn = e.target.closest('[data-ln-profile-id]');
			if (btn) {
				var id = btn.getAttribute('data-ln-profile-id');
				if (id !== self.currentId) {
					self.switchTo(id);
				}
			}
		});

		// Request events (from coordinator / external code)
		this.dom.addEventListener('ln-profile:request-create', function (e) {
			self.create(e.detail.name);
		});

		this.dom.addEventListener('ln-profile:request-remove', function (e) {
			self.remove(e.detail.id);
		});

		this.dom.addEventListener('ln-profile:request-hydrate', function (e) {
			self.hydrate(e.detail.profiles || []);
		});
	};

	/* ─── Hydrate (called by coordinator with DB data) ───────────── */

	_component.prototype.hydrate = function (profilesArr) {
		var self = this;
		profilesArr.forEach(function (p) {
			self.profiles[p.id] = p;
		});

		this._renderButtons();
		this._updateEmptyState();

		var keys = Object.keys(this.profiles);
		if (keys.length > 0) {
			this.switchTo(keys[0]);
		}

		_dispatch(this.dom, 'ln-profile:ready', {
			profiles: this.profiles,
			currentId: this.currentId
		});
	};

	/* ─── Render ──────────────────────────────────────────────────── */

	_component.prototype._renderButtons = function () {
		// Remove old profile buttons
		this.dom.querySelectorAll('[data-ln-profile-id]').forEach(function (btn) {
			btn.remove();
		});

		var self = this;
		var keys = Object.keys(this.profiles);
		keys.forEach(function (id) {
			var frag = _cloneTemplate('profile-btn');
			var btn = frag.querySelector('[data-ln-profile-id]');
			btn.setAttribute('data-ln-profile-id', id);
			btn.textContent = self.profiles[id].name;
			self.dom.insertBefore(btn, self.addBtn);
		});

		this._updateActive();
	};

	_component.prototype._updateActive = function () {
		var self = this;
		this.dom.querySelectorAll('[data-ln-profile-id]').forEach(function (btn) {
			btn.classList.toggle('active', btn.getAttribute('data-ln-profile-id') === self.currentId);
		});
	};

	_component.prototype._updateEmptyState = function () {
		var hasProfiles = Object.keys(this.profiles).length > 0;
		if (this.emptyState) this.emptyState.hidden = hasProfiles;
		if (this.decksPanel) this.decksPanel.hidden = !hasProfiles;
		if (this.sidebar) this.sidebar.hidden = !hasProfiles;
	};

	/* ─── Public Methods ──────────────────────────────────────────── */

	_component.prototype.switchTo = function (id) {
		if (!this.profiles[id]) return;

		this.currentId = id;
		this._updateActive();

		_dispatch(this.dom, 'ln-profile:switched', {
			profileId: id,
			profile: this.profiles[id]
		});
	};

	_component.prototype.create = function (name) {
		var base = _generateId(name);
		var id = _uniqueId(base, this.profiles);

		this.profiles[id] = { id: id, name: name, playlists: {} };

		this._renderButtons();
		this._updateEmptyState();
		this.switchTo(id);

		_dispatch(this.dom, 'ln-profile:created', {
			profileId: id,
			profile: this.profiles[id]
		});

		return id;
	};

	_component.prototype.remove = function (id) {
		if (!id || !this.profiles[id]) return;

		delete this.profiles[id];

		this._renderButtons();
		this._updateEmptyState();

		var remaining = Object.keys(this.profiles);
		if (remaining.length > 0) {
			this.switchTo(remaining[0]);
		} else {
			this.currentId = null;
			_dispatch(this.dom, 'ln-profile:switched', {
				profileId: null,
				profile: null
			});
		}

		_dispatch(this.dom, 'ln-profile:deleted', { profileId: id });
	};

	_component.prototype.getProfile = function (id) {
		return this.profiles[id] || null;
	};

	_component.prototype.getCurrent = function () {
		if (!this.currentId) return null;
		return this.profiles[this.currentId] || null;
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
