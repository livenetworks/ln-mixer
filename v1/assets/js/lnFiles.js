(function () {
	const DOM_ATTRIBUTE = "lnFiles";
	const STORAGE_KEY = "app:cachedTracks";

	if (window[DOM_ATTRIBUTE]) return;

	function constructor(root) {
		// Автоматски го врзуваме на body и чекаме евент
		_bindCachedListener();
	}

	let listElement = null;
	let templateElement = null;

	// Template engine
	function applyTemplate(html, data) {
		return html.replace(/\[\[\s*(\w+)\s*\]\]/g, (match, key) => {
			return key in data ? data[key] : "";
		});
	}

	function _bindCachedListener() {
		document.addEventListener("tracks:cached", e => {
			const tracks = e.detail?.tracks || [];
			renderList(tracks);
		});
	}

	async function renderFromCache() {
		try {
			const stored = await idbKeyval.get(STORAGE_KEY);
			if (Array.isArray(stored) && stored.length) {
				renderList(stored);
			}
		} catch (err) {
			console.error("❌ Failed to render from cache:", err);
		}
	}

	function renderList(tracks) {
		if (!listElement || !templateElement) {
			const root = document.querySelector("[data-ln-files]");
			if (!root) return;
			listElement = root;
			templateElement = root.querySelector("[data-li-files-template]");
			if (!templateElement) return;
		}

		listElement.querySelectorAll("li:not([data-li-files-template])").forEach(el => el.remove());

		for (const track of tracks) {
			const clone = templateElement.cloneNode(true);
			clone.removeAttribute("data-li-files-template");
			clone.style.display = "";

			// Inject ID
			clone.dataset.trackId = track.filename;

			clone.innerHTML = applyTemplate(clone.innerHTML, track);

			// Set image manually
			const img = clone.querySelector("img");
			if (img && track.coverimage) {
				img.src = track.coverimage;
			}

			listElement.appendChild(clone);
		}
	}

	window[DOM_ATTRIBUTE] = {
		renderFromCache
	};

	constructor(document.body);
})();
