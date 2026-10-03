import { cloneTemplate, fillTemplate, fill, dispatch, registerComponent } from 'ln-ashlar';

const DOM_SELECTOR = 'data-mixer-profile';
const DOM_ATTRIBUTE = 'lnProfile';

if (!window[DOM_ATTRIBUTE]) {

	/* ─── Helpers ──────────────────────────────────────────────────── */

	function _generateId(name) {
		let id = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
		if (!id) id = 'profile';
		return id;
	}

	function _uniqueId(base, existing) {
		if (!existing[base]) return base;
		let counter = 2;
		while (existing[base + '-' + counter]) counter++;
		return base + '-' + counter;
	}



	/* ─── Component ───────────────────────────────────────────────── */

	function _component(dom) {
		this.dom = dom;
		dom[DOM_ATTRIBUTE] = this;

		this.profiles = {};
		this.currentId = null;

		this.addBtn = dom.querySelector('[data-mixer-action="new-profile"]');

		this._bindEvents();

		return this;
	}

	/* ─── Bind Events ─────────────────────────────────────────────── */

	_component.prototype._bindEvents = function () {
		const self = this;

		// Click delegation on nav for profile switching (own buttons only)
		this.dom.addEventListener('click', function (e) {
			const btn = e.target.closest('[data-mixer-profile-id]');
			if (btn) {
				const id = btn.getAttribute('data-mixer-profile-id');
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
		const self = this;
		profilesArr.forEach(function (p) {
			self.profiles[p.id] = p;
		});

		this._renderButtons();

		const keys = Object.keys(this.profiles);
		if (keys.length > 0) {
			this.switchTo(keys[0]);
		}

		dispatch(this.dom, 'ln-profile:ready', {
			profiles: this.profiles,
			currentId: this.currentId
		});
	};

	/* ─── Render ──────────────────────────────────────────────────── */

	_component.prototype._renderButtons = function () {
		// Remove old profile buttons
		this.dom.querySelectorAll('[data-mixer-profile-id]').forEach(function (btn) {
			btn.remove();
		});

		const self = this;
		const keys = Object.keys(this.profiles);
		keys.forEach(function (id) {
			const frag = cloneTemplate('profile-btn', 'ln-profile');
			const data = { id: id, name: self.profiles[id].name };
			fillTemplate(frag, data);
			fill(frag, data);
			self.dom.insertBefore(frag.firstElementChild, self.addBtn);
		});

		this._updateActive();
	};

	_component.prototype._updateActive = function () {
		const self = this;
		this.dom.querySelectorAll('[data-mixer-profile-id]').forEach(function (btn) {
			btn.classList.toggle('active', btn.getAttribute('data-mixer-profile-id') === self.currentId);
		});
	};


	/* ─── Public Methods ──────────────────────────────────────────── */

	_component.prototype.switchTo = function (id) {
		if (!this.profiles[id]) return;

		this.currentId = id;
		this._updateActive();

		dispatch(this.dom, 'ln-profile:switched', {
			profileId: id,
			profile: this.profiles[id]
		});
	};

	_component.prototype.create = function (name) {
		const base = _generateId(name);
		const id = _uniqueId(base, this.profiles);

		this.profiles[id] = { id: id, name: name };

		this._renderButtons();
		this.switchTo(id);

		dispatch(this.dom, 'ln-profile:created', {
			profileId: id,
			profile: this.profiles[id]
		});

		return id;
	};

	_component.prototype.remove = function (id) {
		if (!id || !this.profiles[id]) return;

		delete this.profiles[id];

		this._renderButtons();

		const remaining = Object.keys(this.profiles);
		if (remaining.length > 0) {
			this.switchTo(remaining[0]);
		} else {
			this.currentId = null;
			dispatch(this.dom, 'ln-profile:switched', {
				profileId: null,
				profile: null
			});
		}

		dispatch(this.dom, 'ln-profile:deleted', { profileId: id });
	};

	_component.prototype.getProfile = function (id) {
		return this.profiles[id] || null;
	};

	_component.prototype.getCurrent = function () {
		if (!this.currentId) return null;
		return this.profiles[this.currentId] || null;
	};

	/* ─── Init ────────────────────────────────────────────────────── */

	registerComponent(DOM_SELECTOR, DOM_ATTRIBUTE, _component, 'ln-profile');

}
