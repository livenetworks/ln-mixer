import { cloneTemplate, fillTemplate, fill } from 'ln-ashlar';

const DOM_SELECTOR = 'data-mixer-playlist';
const DOM_ATTRIBUTE = 'lnPlaylist';

if (!window[DOM_ATTRIBUTE]) {

	/* ─── Helpers ──────────────────────────────────────────────────── */

	function _dispatch(element, eventName, detail) {
		element.dispatchEvent(new CustomEvent(eventName, {
			bubbles: true,
			detail: detail || {}
		}));
	}

	function _generateId(name) {
		let id = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
		if (!id) id = 'item';
		return id;
	}

	function _uniqueId(base, existing) {
		if (!existing[base]) return base;
		let counter = 2;
		while (existing[base + '-' + counter]) counter++;
		return base + '-' + counter;
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
			// Skip child playlist groups (they have data-mixer-playlist-id)
			if (el.hasAttribute('data-mixer-playlist-id')) return;
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
		this.trackCatalog = {};
		this.currentId = null;
		this.profileId = null;
		this.deckHighlight = { a: -1, b: -1 };

		this._bindEvents();

		return this;
	}

	/* ─── Bind Events ─────────────────────────────────────────────── */

	_component.prototype._bindEvents = function () {
		const self = this;

		// Click delegation on sidebar (own child elements only)
		this.dom.addEventListener('click', function (e) {
			const loadBtn = e.target.closest('[data-mixer-load-to]');
			if (loadBtn) {
				self._handleLoadToDeck(e);
				return;
			}
		});

		// Playlist accordion — switch playlist when ln-toggle opens
		this.dom.addEventListener('ln-toggle:open', function (e) {
			const playlistId = e.target.getAttribute('data-mixer-playlist-id');
			if (playlistId) {
				self._switchPlaylist(playlistId);
			}
		});

		// Sortable reorder (ln-sortable component handles pointer interaction)
		this.dom.addEventListener('ln-sortable:reordered', function (e) {
			const list = e.target.closest('[data-mixer-track-list]');
			if (!list) return;
			self._syncAfterReorder(list);
		});

		// Request events (from coordinator / external code)
		this.dom.addEventListener('ln-playlist:request-create', function (e) {
			self.createPlaylist(e.detail.name);
		});

		this.dom.addEventListener('ln-playlist:request-add-track', function (e) {
			self.addSegment(e.detail);
		});

		this.dom.addEventListener('ln-playlist:request-edit-track', function (e) {
			self.editSegment(
				e.detail.playlistId || self.currentId,
				e.detail.index,
				{ notes: e.detail.notes }
			);
		});

		this.dom.addEventListener('ln-playlist:request-remove-track', function (e) {
			self.removeSegment(
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
			self.loadProfile(e.detail.profileId, e.detail.playlists, e.detail.trackCatalog);
		});

		this.dom.addEventListener('ln-playlist:request-update-catalog', function (e) {
			self.updateCatalog(e.detail.url, e.detail.track);
		});

		this.dom.addEventListener('ln-playlist:request-add-loop', function (e) {
			self.addLoop(e.detail.playlistId || self.currentId, e.detail.trackIndex, e.detail.loop);
		});

		this.dom.addEventListener('ln-playlist:request-remove-loop', function (e) {
			self.removeLoop(e.detail.playlistId || self.currentId, e.detail.trackIndex, e.detail.loopIndex);
		});

		this.dom.addEventListener('ln-playlist:request-remove-playlist', function (e) {
			self.removePlaylist(e.detail.playlistId);
		});

		this._initSwipeToDelete();
	};

	/* ─── Load Profile ────────────────────────────────────────────── */

	_component.prototype.loadProfile = function (profileId, playlists, trackCatalog) {
		this.profileId = profileId;
		this.currentId = null;
		this.deckHighlight = { a: -1, b: -1 };
		this.playlists = playlists || null;
		this.trackCatalog = trackCatalog || {};
		this._rebuild();
	};

	/* ─── Public API (queries) ────────────────────────────────────── */

	_component.prototype.getPlaylist = function () {
		if (!this.playlists) return null;
		return this.playlists[this.currentId] || null;
	};

	_component.prototype.getTrack = function (index) {
		const playlist = this.getPlaylist();
		if (!playlist) return null;
		const segment = (index >= 0 && index < playlist.segments.length) ? playlist.segments[index] : null;
		if (!segment) return null;
		const catalogEntry = this.trackCatalog[segment.url] || {};
		return {
			url: segment.url,
			title: catalogEntry.title || '',
			artist: catalogEntry.artist || '',
			duration: catalogEntry.duration || '',
			durationSec: catalogEntry.durationSec || 0,
			notes: segment.notes || '',
			loops: segment.loops || []
		};
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

		const base = _generateId(name);
		const id = _uniqueId(this.profileId + '--' + base, this.playlists);

		this.playlists[id] = { id: id, profileId: this.profileId, name: name, segments: [] };

		_dispatch(this.dom, 'ln-playlist:changed', { profileId: this.profileId, playlistId: id });

		// Create accordion section in sidebar
		const section = this._buildPlaylistGroup(id, name, false);

		const list = this.dom.querySelector('.playlist-list');
		if (list) list.appendChild(section);

		// Open the new toggle via request event
		section.dispatchEvent(new CustomEvent('ln-toggle:request-open'));

		this._switchPlaylist(id);

		_dispatch(this.dom, 'ln-playlist:created', {
			playlistId: id,
			name: name
		});

		return id;
	};

	_component.prototype.addSegment = function (trackData) {
		const playlist = this.getPlaylist();
		if (!playlist) return -1;

		const newSegment = {
			url: trackData.url || '',
			notes: ''
		};
		playlist.segments.push(newSegment);

		// Update track catalog with metadata from coordinator
		if (trackData.url) {
			this.trackCatalog[trackData.url] = {
				url: trackData.url,
				title: trackData.title || '',
				artist: trackData.artist || '',
				duration: trackData.duration || '',
				durationSec: trackData.durationSec || 0
			};
		}

		_dispatch(this.dom, 'ln-playlist:changed', { profileId: this.profileId, playlistId: this.currentId });

		// Add to sidebar track list DOM
		const list = this._getActiveTrackList();
		if (list) {
			const idx = playlist.segments.length - 1;
			const li = this._buildTrackItem(newSegment, idx);
			list.appendChild(li);

			li.classList.add('just-added');
			setTimeout(function () { li.classList.remove('just-added'); }, 700);
		}

		const addedIdx = playlist.segments.length - 1;

		_dispatch(this.dom, 'ln-playlist:track-added', {
			trackIndex: addedIdx,
			track: this.getTrack(addedIdx),
			playlistId: this.currentId
		});

		return addedIdx;
	};

	_component.prototype.editSegment = function (playlistId, index, data) {
		if (!this.playlists || !this.playlists[playlistId]) return false;
		const playlist = this.playlists[playlistId];
		if (index < 0 || index >= playlist.segments.length) return false;

		if (data.notes !== undefined) playlist.segments[index].notes = data.notes;

		_dispatch(this.dom, 'ln-playlist:changed', { profileId: this.profileId, playlistId: playlistId });

		// Update DOM
		const list = this.dom.querySelector('[data-mixer-track-list="' + playlistId + '"]');
		if (list) {
			const li = list.querySelector('[data-mixer-track="' + index + '"]');
			if (li) {
				const notesP = li.querySelector('.track-notes');
				if (notesP) notesP.textContent = data.notes || '';
			}
		}

		_dispatch(this.dom, 'ln-playlist:track-edited', {
			trackIndex: index,
			playlistId: playlistId
		});

		return true;
	};

	_component.prototype.updateCatalog = function (url, trackData) {
		if (!url || !trackData) return;

		this.trackCatalog[url] = {
			url: url,
			title: trackData.title || this.trackCatalog[url] && this.trackCatalog[url].title || '',
			artist: trackData.artist || this.trackCatalog[url] && this.trackCatalog[url].artist || '',
			duration: trackData.duration || '',
			durationSec: trackData.durationSec || 0
		};

		// Update DOM for all segments referencing this URL
		if (!this.playlists) return;
		for (const pid in this.playlists) {
			if (!this.playlists.hasOwnProperty(pid)) continue;
			const segments = this.playlists[pid].segments;
			const list = this.dom.querySelector('[data-mixer-track-list="' + pid + '"]');

			for (let i = 0; i < segments.length; i++) {
				if (segments[i].url === url && list) {
					const li = list.querySelector('[data-mixer-track="' + i + '"]');
					if (li) {
						fill(li, { duration: trackData.duration || '' });
					}
				}
			}
		}
	};

	_component.prototype.removeSegment = function (playlistId, index) {
		if (!this.playlists || !this.playlists[playlistId]) return false;
		const playlist = this.playlists[playlistId];
		if (index < 0 || index >= playlist.segments.length) return false;

		playlist.segments.splice(index, 1);

		_dispatch(this.dom, 'ln-playlist:changed', { profileId: this.profileId, playlistId: playlistId });

		// Remove from DOM + renumber
		const list = this.dom.querySelector('[data-mixer-track-list="' + playlistId + '"]');
		if (list) {
			const li = list.querySelector('[data-mixer-track="' + index + '"]');
			if (li) li.remove();

			const items = Array.from(list.querySelectorAll('[data-mixer-track]'));
			items.forEach(function (item, newIdx) {
				item.setAttribute('data-mixer-track', newIdx);
				const numSpan = item.querySelector('.track-number');
				if (numSpan) numSpan.textContent = newIdx + 1;
			});
		}

		_dispatch(this.dom, 'ln-playlist:track-removed', {
			trackIndex: index,
			playlistId: playlistId
		});

		return true;
	};

	_component.prototype.addLoop = function (playlistId, trackIndex, loopData) {
		if (!this.playlists || !this.playlists[playlistId]) return false;
		const segment = this.playlists[playlistId].segments[trackIndex];
		if (!segment) return false;

		if (!segment.loops) segment.loops = [];
		segment.loops.push(loopData);

		_dispatch(this.dom, 'ln-playlist:changed', { profileId: this.profileId, playlistId: playlistId });
		this._updateTrackLoopIndicator(playlistId, trackIndex, segment);

		_dispatch(this.dom, 'ln-playlist:loop-added', {
			playlistId: playlistId,
			trackIndex: trackIndex,
			loopIndex: segment.loops.length - 1,
			loops: segment.loops
		});

		return true;
	};

	_component.prototype.removeLoop = function (playlistId, trackIndex, loopIndex) {
		if (!this.playlists || !this.playlists[playlistId]) return false;
		const segment = this.playlists[playlistId].segments[trackIndex];
		if (!segment || !segment.loops || loopIndex < 0 || loopIndex >= segment.loops.length) return false;

		segment.loops.splice(loopIndex, 1);
		if (segment.loops.length === 0) delete segment.loops;

		_dispatch(this.dom, 'ln-playlist:changed', { profileId: this.profileId, playlistId: playlistId });
		this._updateTrackLoopIndicator(playlistId, trackIndex, segment);

		_dispatch(this.dom, 'ln-playlist:loop-removed', {
			playlistId: playlistId,
			trackIndex: trackIndex,
			loopIndex: loopIndex,
			loops: segment.loops || []
		});

		return true;
	};

	_component.prototype.removePlaylist = function (playlistId) {
		if (!this.playlists || !this.playlists[playlistId]) return false;

		const name = this.playlists[playlistId].name;
		const segmentCount = this.playlists[playlistId].segments.length;

		delete this.playlists[playlistId];

		// Remove DOM section
		const section = this.dom.querySelector('[data-mixer-playlist-id="' + playlistId + '"]');
		if (section) section.remove();

		// If deleted playlist was the current one, switch to first remaining or null
		if (this.currentId === playlistId) {
			let firstId = null;
			for (const id in this.playlists) {
				if (this.playlists.hasOwnProperty(id)) {
					firstId = id;
					break;
				}
			}
			this.currentId = firstId;

			if (firstId) {
				const nextSection = this.dom.querySelector('[data-mixer-playlist-id="' + firstId + '"]');
				if (nextSection) {
					nextSection.dispatchEvent(new CustomEvent('ln-toggle:request-open'));
				}
			}
		}

		_dispatch(this.dom, 'ln-playlist:playlist-removed', {
			playlistId: playlistId,
			name: name,
			trackCount: segmentCount
		});

		return true;
	};

	_component.prototype.openEditTrack = function (idx) {
		const playlist = this.getPlaylist();
		if (!playlist || idx < 0 || idx >= playlist.segments.length) return;

		const track = this.getTrack(idx);

		_dispatch(this.dom, 'ln-playlist:open-edit', {
			index: idx,
			track: track,
			playlistId: this.currentId
		});
	};

	/* ─── Rebuild Sidebar ─────────────────────────────────────────── */

	_component.prototype._buildPlaylistGroup = function (id, name, isOpen) {
		const data = {
			id: id,
			name: name,
			toggleState: isOpen ? 'open' : '',
			toggleId: 'playlist-' + id
		};
		const frag = cloneTemplate('playlist-group', 'ln-playlist');
		fillTemplate(frag, data);
		fill(frag, data);
		return frag.firstElementChild;
	};

	_component.prototype._rebuild = function () {
		const list = this.dom.querySelector('.playlist-list');
		if (!list) return;

		// Remove all existing playlist groups
		list.querySelectorAll('.playlist-group').forEach(function (group) {
			group.remove();
		});

		if (!this.playlists) return;

		// Build from playlists using ln-toggle / ln-accordion
		let first = true;
		let firstId = null;
		for (const id in this.playlists) {
			if (!this.playlists.hasOwnProperty(id)) continue;
			if (first) { firstId = id; }

			const section = this._buildPlaylistGroup(id, this.playlists[id].name, first);
			this._populateTrackList(section.querySelector('.track-list'), id);
			list.appendChild(section);
			first = false;
		}

		if (firstId) {
			this.currentId = firstId;
		} else {
			this.currentId = null;
		}
	};

	_component.prototype._populateTrackList = function (ol, playlistId) {
		const self = this;
		this.playlists[playlistId].segments.forEach(function (segment, idx) {
			ol.appendChild(self._buildTrackItem(segment, idx));
		});
	};

	_component.prototype._buildTrackItem = function (segment, idx) {
		const catalogEntry = this.trackCatalog[segment.url] || {};
		const loopCount = segment.loops ? segment.loops.length : 0;
		const data = {
			index: idx,
			number: idx + 1,
			title: catalogEntry.title || segment.url || '',
			artist: catalogEntry.artist || '',
			duration: catalogEntry.duration || '',
			notes: segment.notes || '',
			hasLoops: loopCount > 0,
			loopText: loopCount + ' loop' + (loopCount > 1 ? 's' : '')
		};
		const frag = cloneTemplate('track-item', 'ln-playlist');
		fillTemplate(frag, data);
		fill(frag, data);
		const li = frag.firstElementChild;
		li.setAttribute('data-mixer-track', idx);
		return li;
	};

	_component.prototype._updateTrackLoopIndicator = function (playlistId, trackIndex, segment) {
		const list = this.dom.querySelector('[data-mixer-track-list="' + playlistId + '"]');
		if (!list) return;
		const li = list.querySelector('[data-mixer-track="' + trackIndex + '"]');
		if (!li) return;

		const loopCount = segment.loops ? segment.loops.length : 0;
		const data = {
			hasLoops: loopCount > 0,
			loopText: loopCount + ' loop' + (loopCount > 1 ? 's' : '')
		};
		fill(li, data);
	};

	/* ─── Swipe-to-Delete ────────────────────────────────────────── */

	_component.prototype._initSwipeToDelete = function () {
		const self = this;
		const THRESHOLD_PX = 30;
		const COMMIT_RATIO = 0.3;
		let startX = 0;
		let startY = 0;
		let currentLi = null;
		let contentEl = null;
		let tracking = false;
		let swiping = false;
		let liWidth = 0;

		this.dom.addEventListener('pointerdown', function (e) {
			// Ignore drag handle (ln-sortable owns that)
			if (e.target.closest('[data-ln-sortable-handle]')) return;
			// Ignore buttons
			if (e.target.closest('button')) return;
			// Must be on a track item
			const li = e.target.closest('[data-mixer-track]');
			if (!li) return;

			startX = e.clientX;
			startY = e.clientY;
			currentLi = li;
			contentEl = li.querySelector('.track-content');
			tracking = true;
			swiping = false;
			liWidth = li.offsetWidth;
		});

		this.dom.addEventListener('pointermove', function (e) {
			if (!tracking || !currentLi) return;

			const deltaX = e.clientX - startX;
			const deltaY = e.clientY - startY;

			// Vertical dominant = cancel swipe, allow scroll
			if (!swiping && Math.abs(deltaY) > Math.abs(deltaX)) {
				tracking = false;
				currentLi = null;
				return;
			}

			// Only track leftward swipe
			if (deltaX > 0) {
				if (swiping && contentEl) {
					contentEl.style.transform = '';
					currentLi.removeAttribute('data-mixer-swiping');
				}
				return;
			}

			// Start swiping once past threshold
			if (!swiping && Math.abs(deltaX) > THRESHOLD_PX) {
				swiping = true;
				currentLi.setAttribute('data-mixer-swiping', '');
				currentLi.setPointerCapture(e.pointerId);
			}

			if (swiping && contentEl) {
				const clampedX = Math.max(deltaX, -liWidth);
				contentEl.style.transform = 'translateX(' + clampedX + 'px)';
			}
		});

		this.dom.addEventListener('pointerup', function (e) {
			if (!tracking || !currentLi) return;

			const deltaX = e.clientX - startX;
			const li = currentLi;
			const content = contentEl;

			tracking = false;
			currentLi = null;
			contentEl = null;

			if (!swiping) return;

			const commitThreshold = liWidth * COMMIT_RATIO;

			if (Math.abs(deltaX) >= commitThreshold) {
				// Commit: animate out → collapse → remove
				const trackIdx = parseInt(li.getAttribute('data-mixer-track'), 10);
				const playlistId = self.currentId;

				content.addEventListener('transitionend', function handler() {
					content.removeEventListener('transitionend', handler);
					li.style.maxHeight = li.offsetHeight + 'px';
					li.offsetHeight; // force reflow
					li.setAttribute('data-mixer-swipe-committed', '');

					li.addEventListener('transitionend', function collapseHandler() {
						li.removeEventListener('transitionend', collapseHandler);
						self.removeSegment(playlistId, trackIdx);
					});
				});

				content.style.transition = 'transform 0.2s ease-out';
				content.style.transform = 'translateX(-100%)';
			} else {
				// Snap back
				li.removeAttribute('data-mixer-swiping');
				content.addEventListener('transitionend', function handler() {
					content.removeEventListener('transitionend', handler);
					content.style.transition = '';
				});

				content.style.transition = 'transform 0.2s ease-out';
				content.style.transform = '';
			}

			swiping = false;
		});

		this.dom.addEventListener('pointercancel', function () {
			if (!tracking || !currentLi) return;
			if (swiping && contentEl) {
				contentEl.style.transform = '';
				contentEl.style.transition = '';
				currentLi.removeAttribute('data-mixer-swiping');
			}
			tracking = false;
			swiping = false;
			currentLi = null;
			contentEl = null;
		});
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
		return this.dom.querySelector('[data-mixer-track-list="' + this.currentId + '"]');
	};

	_component.prototype._updateHighlights = function () {
		const list = this._getActiveTrackList();
		if (!list) return;

		list.querySelectorAll('[data-mixer-track]').forEach(function (li) {
			li.classList.remove('active-a', 'active-b');

			const btnA = li.querySelector('[data-mixer-load-to="a"]');
			const btnB = li.querySelector('[data-mixer-load-to="b"]');
			if (btnA) btnA.classList.remove('load-btn--loaded');
			if (btnB) btnB.classList.remove('load-btn--loaded');
		});

		const self = this;
		['a', 'b'].forEach(function (deckId) {
			if (self.deckHighlight[deckId] >= 0) {
				const li = list.querySelector('[data-mixer-track="' + self.deckHighlight[deckId] + '"]');
				if (li) {
					li.classList.add('active-' + deckId);
					const btn = li.querySelector('[data-mixer-load-to="' + deckId + '"]');
					if (btn) btn.classList.add('load-btn--loaded');
				}
			}
		});
	};

	/* ─── Load to Deck ────────────────────────────────────────────── */

	_component.prototype._handleLoadToDeck = function (e) {
		const btn = e.target.closest('[data-mixer-load-to]');
		if (!btn) return;

		const targetDeck = btn.getAttribute('data-mixer-load-to');
		const li = btn.closest('[data-mixer-track]');
		if (!li || !targetDeck) return;

		const trackIdx = parseInt(li.getAttribute('data-mixer-track'), 10);
		const playlist = this.getPlaylist();
		if (!playlist || trackIdx < 0 || trackIdx >= playlist.segments.length) return;

		_dispatch(this.dom, 'ln-playlist:load-to-deck', {
			deckId: targetDeck,
			trackIndex: trackIdx,
			track: this.getTrack(trackIdx),
			playlistId: this.currentId
		});
	};

	/* ─── Sync After Reorder (triggered by ln-sortable:reordered) ──── */

	_component.prototype._syncAfterReorder = function (list) {
		const items = Array.from(list.querySelectorAll('[data-mixer-track]'));
		const playlist = this.getPlaylist();
		if (!playlist) return;

		const newSegments = [];
		const oldIndexToNew = {};

		items.forEach(function (li, newIdx) {
			const oldIdx = parseInt(li.getAttribute('data-mixer-track'), 10);
			oldIndexToNew[oldIdx] = newIdx;
			newSegments.push(playlist.segments[oldIdx]);

			li.setAttribute('data-mixer-track', newIdx);
			const numSpan = li.querySelector('.track-number');
			if (numSpan) numSpan.textContent = newIdx + 1;
		});

		playlist.segments = newSegments;

		_dispatch(this.dom, 'ln-playlist:changed', { profileId: this.profileId, playlistId: this.currentId });

		_dispatch(this.dom, 'ln-playlist:reordered', {
			oldToNew: oldIndexToNew,
			playlistId: this.currentId
		});

		this._updateHighlights();
	};

	/* ─── DOM Observer (childList) ────────────────────────────────── */

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
