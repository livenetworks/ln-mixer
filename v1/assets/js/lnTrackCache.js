(function () {
	const DOM_ATTRIBUTE = "lnTrackCache";
	const STORAGE_KEY = "app:cachedTracks";

	if (window[DOM_ATTRIBUTE]) return;

	function constructor(root) {
		// Автоматски refresh ако имаме folderHandle
		loadAndCacheTracks();
	}

	async function loadAndCacheTracks() {
		const folder = lnFileAccess.getFolderHandle();
		if (!folder) {
			console.warn("No folder handle available for track cache.");
			return;
		}

		let cache = [];

		for await (const [name, handle] of folder.entries()) {
			if (handle.kind !== "file") continue;
			const ext = name.split(".").pop().toLowerCase();
			if (!["mp3", "m4a"].includes(ext)) continue;

			try {
				const file = await handle.getFile();

				await new Promise((resolve, reject) => {
					jsmediatags.read(file, {
						onSuccess: tag => {
							const { artist, title } = tag.tags;
							let coverimage = "./assets/img/placeholder.svg";

							if (tag.tags.picture) {
								const { data, format } = tag.tags.picture;
								let byteArray = new Uint8Array(data);
								let blob = new Blob([byteArray], { type: format });
								coverimage = URL.createObjectURL(blob);
							}

							cache.push({
								filename: file.name,
								fullpath: file.name,
								artist: artist || "Unknown",
								title: title || file.name,
								coverimage
							});
							resolve();
						},
						onError: error => {
							console.warn("Metadata read failed:", error);
							cache.push({
								filename: file.name,
								fullpath: file.name,
								artist: "Unknown",
								title: file.name,
								coverimage: "./assets/img/placeholder.svg"
							});
							resolve();
						}
					});
				});

			} catch (err) {
				console.warn("Failed to process file:", name, err);
			}
		}

		try {
			await idbKeyval.set(STORAGE_KEY, cache);
			console.log(`✅ Cached ${cache.length} tracks`);

			document.dispatchEvent(new CustomEvent("tracks:cached", {
				detail: { tracks: cache }
			}));
		} catch (err) {
			console.error("❌ Failed to store track cache:", err);
		}
	}

	constructor.loadFromStorage = async function () {
		try {
			const stored = await idbKeyval.get(STORAGE_KEY);
			if (stored && stored.length) {
				document.dispatchEvent(new CustomEvent("tracks:cached", {
					detail: { tracks: stored }
				}));
			}
		} catch (err) {
			console.error("Failed to load from cache:", err);
		}
	};

	window[DOM_ATTRIBUTE] = constructor;
	constructor(document.body);
})();
