(function () {
	'use strict';

	var DOM_SELECTOR = 'data-ln-playlist';
	var DOM_ATTRIBUTE = 'lnPlaylist';

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
		if (!id) id = 'item';
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
			// Skip child playlist groups (they have data-ln-playlist-id)
			if (el.hasAttribute('data-ln-playlist-id')) return;
			if (!el[DOM_ATTRIBUTE]) {
				el[DOM_ATTRIBUTE] = new _component(el);
			}
		});
	}

	/* ─── Component ───────────────────────────────────────────────── */

	function _component(dom) {
		this.dom = dom;
		dom[DOM_ATTRIBUTE] = this;

		this.playlists = null;
		this.currentId = null;
		this.profileId = null;
		this.deckHighlight = { a: -1, b: -1 };

		this._bindEvents();

		return this;
	}

	/* ─── Bind Events ─────────────────────────────────────────────── */

	_component.prototype._bindEvents = function () {
		var self = this;

		// Click delegation on sidebar (own child elements only)
		this.dom.addEventListener('click', function (e) {
			var loadBtn = e.target.closest('[data-ln-load-to]');
			if (loadBtn) {
				self._handleLoadToDeck(e);
				return;
			}
		});

		// Playlist accordion — switch playlist when ln-toggle opens
		document.addEventListener('ln-toggle:open', function (e) {
			var playlistId = e.target.getAttribute('data-ln-playlist-id');
			if (playlistId) {
				self._switchPlaylist(playlistId);
			}
		});

		// Sortable reorder (ln-sortable component handles pointer interaction)
		this.dom.addEventListener('ln-sortable:reordered', function (e) {
			var list = e.target.closest('[data-ln-track-list]');
			if (!list) return;
			self._syncAfterReorder(list);
		});

		// Request events (from coordinator / external code)
		this.dom.addEventListener('ln-playlist:request-create', function (e) {
			self.createPlaylist(e.detail.name);
		});

		this.dom.addEventListener('ln-playlist:request-add-track', function (e) {
			self.addTrack(e.detail);
		});

		this.dom.addEventListener('ln-playlist:request-edit-track', function (e) {
			self.editTrack(
				e.detail.playlistId || self.currentId,
				e.detail.index,
				{ notes: e.detail.notes }
			);
		});

		this.dom.addEventListener('ln-playlist:request-remove-track', function (e) {
			self.removeTrack(
				e.detail.playlistId || self.currentId,
				e.detail.index
			);
		});

		this.dom.addEventListener('ln-playlist:request-open-edit', function (e) {
			self.openEditTrack(e.detail.index);
		});

		this.dom.addEventListener('ln-playlist:request-highlight', function (e) {
			self.highlightDeck(e.detail.deckId, e.detail.index);
		});

		this.dom.addEventListener('ln-playlist:request-load-profile', function (e) {
			self.loadProfile(e.detail.profileId, e.detail.playlists);
		});
	};

	/* ─── Load Profile ────────────────────────────────────────────── */

	_component.prototype.loadProfile = function (profileId, playlists) {
		this.profileId = profileId;
		this.currentId = null;
		this.deckHighlight = { a: -1, b: -1 };
		this.playlists = playlists || null;
		this._rebuild();
	};

	/* ─── Public API (queries) ────────────────────────────────────── */

	_component.prototype.getPlaylist = function () {
		if (!this.playlists) return null;
		return this.playlists[this.currentId] || null;
	};

	_component.prototype.getTrack = function (index) {
		var playlist = this.getPlaylist();
		if (!playlist) return null;
		return (index >= 0 && index < playlist.tracks.length) ? playlist.tracks[index] : null;
	};

	_component.prototype.highlightDeck = function (deckId, index) {
		this.deckHighlight[deckId] = index;
		this._updateHighlights();
	};

	_component.prototype.clearHighlights = function () {
		this.deckHighlight = { a: -1, b: -1 };
		this._updateHighlights();
	};

	/* ─── Public API (commands) ───────────────────────────────────── */

	_component.prototype.createPlaylist = function (name) {
		if (!name || !this.playlists) return null;

		var base = _generateId(name);
		var id = _uniqueId(base, this.playlists);

		this.playlists[id] = { name: name, tracks: [] };

		_dispatch(this.dom, 'ln-playlist:changed', { profileId: this.profileId });

		// Create accordion section in sidebar
		var section = this._buildPlaylistGroup(id, name, false);

		var footer = this.dom.querySelector('.sidebar-footer');
		this.dom.insertBefore(section, footer);

		// Open the new toggle via request event
		section.dispatchEvent(new CustomEvent('ln-toggle:request-open'));

		this._switchPlaylist(id);

		_dispatch(this.dom, 'ln-playlist:created', {
			playlistId: id,
			name: name
		});

		return id;
	};

	_component.prototype.addTrack = function (trackData) {
		var playlist = this.getPlaylist();
		if (!playlist) return -1;

		var newTrack = {
			title: trackData.title,
			artist: trackData.artist,
			duration: trackData.duration || '',
			durationSec: trackData.durationSec || 0,
			url: trackData.url || '',
			loop: false,
			cueStart: '',
			cueEnd: '',
			cueStartPct: 0,
			cueEndPct: 0,
			notes: ''
		};
		playlist.tracks.push(newTrack);

		_dispatch(this.dom, 'ln-playlist:changed', { profileId: this.profileId });

		// Add to sidebar track list DOM
		var list = this._getActiveTrackList();
		if (list) {
			var idx = playlist.tracks.length - 1;
			var li = this._buildTrackItem(newTrack, idx);
			list.appendChild(li);

			li.classList.add('just-added');
			setTimeout(function () { li.classList.remove('just-added'); }, 700);
		}

		var addedIdx = playlist.tracks.length - 1;

		_dispatch(this.dom, 'ln-playlist:track-added', {
			trackIndex: addedIdx,
			track: newTrack,
			playlistId: this.currentId
		});

		return addedIdx;
	};

	_component.prototype.editTrack = function (playlistId, index, data) {
		if (!this.playlists || !this.playlists[playlistId]) return false;
		var playlist = this.playlists[playlistId];
		if (index < 0 || index >= playlist.tracks.length) return false;

		if (data.notes !== undefined) playlist.tracks[index].notes = data.notes;

		_dispatch(this.dom, 'ln-playlist:changed', { profileId: this.profileId });

		// Update DOM
		var list = this.dom.querySelector('[data-ln-track-list="' + playlistId + '"]');
		if (list) {
			var li = list.querySelector('[data-ln-track="' + index + '"]');
			if (li) {
				var notesP = li.querySelector('.track-notes');
				if (notesP) notesP.textContent = data.notes || '';
			}
		}

		_dispatch(this.dom, 'ln-playlist:track-edited', {
			trackIndex: index,
			playlistId: playlistId
		});

		return true;
	};

	_component.prototype.removeTrack = function (playlistId, index) {
		if (!this.playlists || !this.playlists[playlistId]) return false;
		var playlist = this.playlists[playlistId];
		if (index < 0 || index >= playlist.tracks.length) return false;

		playlist.tracks.splice(index, 1);

		_dispatch(this.dom, 'ln-playlist:changed', { profileId: this.profileId });

		// Remove from DOM + renumber
		var list = this.dom.querySelector('[data-ln-track-list="' + playlistId + '"]');
		if (list) {
			var li = list.querySelector('[data-ln-track="' + index + '"]');
			if (li) li.remove();

			var items = Array.from(list.querySelectorAll('[data-ln-track]'));
			items.forEach(function (item, newIdx) {
				item.setAttribute('data-ln-track', newIdx);
				var numSpan = item.querySelector('.track-number');
				if (numSpan) numSpan.textContent = newIdx + 1;
			});
		}

		_dispatch(this.dom, 'ln-playlist:track-removed', {
			trackIndex: index,
			playlistId: playlistId
		});

		return true;
	};

	_component.prototype.openEditTrack = function (idx) {
		var playlist = this.getPlaylist();
		if (!playlist || idx < 0 || idx >= playlist.tracks.length) return;

		var track = playlist.tracks[idx];

		// Set context on form element
		var form = document.querySelector('[data-ln-form="edit-track"]');
		if (form) {
			form.setAttribute('data-ln-track-index', idx);
			form.setAttribute('data-ln-playlist-id', this.currentId);
		}

		_dispatch(this.dom, 'ln-playlist:open-edit', {
			index: idx,
			track: track,
			playlistId: this.currentId
		});
	};

	/* ─── Rebuild Sidebar ─────────────────────────────────────────── */

	_component.prototype._buildPlaylistGroup = function (id, name, isOpen) {
		var toggleId = 'playlist-' + id;
		var frag = _cloneTemplate('playlist-group');
		var section = frag.querySelector('.playlist-group');

		section.setAttribute('data-ln-toggle', isOpen ? 'open' : '');
		section.setAttribute('data-ln-playlist-id', id);
		section.id = toggleId;

		var hdr = section.querySelector('header');
		hdr.setAttribute('data-ln-toggle-for', toggleId);
		hdr.setAttribute('data-ln-playlist-toggle', id);
		hdr.textContent = name;

		section.querySelector('.track-list').setAttribute('data-ln-track-list', id);

		return section;
	};

	_component.prototype._rebuild = function () {
		var footer = this.dom.querySelector('.sidebar-footer');

		// Remove all existing playlist groups
		this.dom.querySelectorAll('.playlist-group').forEach(function (group) {
			group.remove();
		});

		if (!this.playlists) return;

		// Build from playlists using ln-toggle / ln-accordion
		var first = true;
		var firstId = null;
		for (var id in this.playlists) {
			if (!this.playlists.hasOwnProperty(id)) continue;
			if (first) { firstId = id; }

			var section = this._buildPlaylistGroup(id, this.playlists[id].name, first);
			this._populateTrackList(section.querySelector('.track-list'), id);
			this.dom.insertBefore(section, footer);
			first = false;
		}

		if (firstId) {
			this.currentId = firstId;
		} else {
			this.currentId = null;
		}
	};

	_component.prototype._populateTrackList = function (ol, playlistId) {
		var self = this;
		this.playlists[playlistId].tracks.forEach(function (track, idx) {
			ol.appendChild(self._buildTrackItem(track, idx));
		});
	};

	_component.prototype._buildTrackItem = function (track, idx) {
		var frag = _cloneTemplate('track-item');
		var li = frag.querySelector('[data-ln-track]');

		li.setAttribute('data-ln-track', idx);
		li.querySelector('.track-number').textContent = idx + 1;
		li.querySelector('.track-name').textContent = track.title;
		li.querySelector('.track-artist').textContent = track.artist;
		li.querySelector('.track-duration').textContent = track.duration;
		li.querySelector('.track-notes').textContent = track.notes || '';

		var indicators = li.querySelector('.track-indicators');
		if (track.loop) {
			var loopIcon = document.createElement('span');
			loopIcon.className = 'ln-icon-loop ln-icon--sm indicator-loop';
			loopIcon.title = 'Loop';
			indicators.appendChild(loopIcon);
		}
		if (track.cueStart || track.cueEnd) {
			var cueSpan = document.createElement('span');
			cueSpan.className = 'cue-range';
			cueSpan.textContent = (track.cueStart || '0:00') + '-' + (track.cueEnd || '0:00');
			indicators.appendChild(cueSpan);
		}

		return li;
	};

	/* ─── Switch Playlist ─────────────────────────────────────────── */

	_component.prototype._switchPlaylist = function (id) {
		this.currentId = id;
		this._updateHighlights();
		_dispatch(this.dom, 'ln-playlist:switched', { playlistId: id });
	};

	/* ─── Track Highlight ─────────────────────────────────────────── */

	_component.prototype._getActiveTrackList = function () {
		if (!this.currentId) return null;
		return this.dom.querySelector('[data-ln-track-list="' + this.currentId + '"]');
	};

	_component.prototype._updateHighlights = function () {
		var list = this._getActiveTrackList();
		if (!list) return;

		list.querySelectorAll('[data-ln-track]').forEach(function (li) {
			li.classList.remove('active-a', 'active-b');

			var btnA = li.querySelector('[data-ln-load-to="a"]');
			var btnB = li.querySelector('[data-ln-load-to="b"]');
			if (btnA) btnA.classList.remove('load-btn--loaded');
			if (btnB) btnB.classList.remove('load-btn--loaded');
		});

		var self = this;
		['a', 'b'].forEach(function (deckId) {
			if (self.deckHighlight[deckId] >= 0) {
				var li = list.querySelector('[data-ln-track="' + self.deckHighlight[deckId] + '"]');
				if (li) {
					li.classList.add('active-' + deckId);
					var btn = li.querySelector('[data-ln-load-to="' + deckId + '"]');
					if (btn) btn.classList.add('load-btn--loaded');
				}
			}
		});
	};

	/* ─── Load to Deck ────────────────────────────────────────────── */

	_component.prototype._handleLoadToDeck = function (e) {
		var btn = e.target.closest('[data-ln-load-to]');
		if (!btn) return;

		var targetDeck = btn.getAttribute('data-ln-load-to');
		var li = btn.closest('[data-ln-track]');
		if (!li || !targetDeck) return;

		var trackIdx = parseInt(li.getAttribute('data-ln-track'), 10);
		var playlist = this.getPlaylist();
		if (!playlist || trackIdx < 0 || trackIdx >= playlist.tracks.length) return;

		_dispatch(this.dom, 'ln-playlist:load-to-deck', {
			deckId: targetDeck,
			trackIndex: trackIdx,
			track: playlist.tracks[trackIdx],
			playlistId: this.currentId
		});
	};

	/* ─── Sync After Reorder (triggered by ln-sortable:reordered) ──── */

	_component.prototype._syncAfterReorder = function (list) {
		var items = Array.from(list.querySelectorAll('[data-ln-track]'));
		var playlist = this.getPlaylist();
		if (!playlist) return;

		var newTracks = [];
		var oldIndexToNew = {};

		items.forEach(function (li, newIdx) {
			var oldIdx = parseInt(li.getAttribute('data-ln-track'), 10);
			oldIndexToNew[oldIdx] = newIdx;
			newTracks.push(playlist.tracks[oldIdx]);

			li.setAttribute('data-ln-track', newIdx);
			var numSpan = li.querySelector('.track-number');
			if (numSpan) numSpan.textContent = newIdx + 1;
		});

		playlist.tracks = newTracks;

		_dispatch(this.dom, 'ln-playlist:changed', { profileId: this.profileId });

		_dispatch(this.dom, 'ln-playlist:reordered', {
			oldToNew: oldIndexToNew,
			playlistId: this.currentId
		});

		this._updateHighlights();
	};

	/* ─── DOM Observer (childList) ────────────────────────────────── */

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
