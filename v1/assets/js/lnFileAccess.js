(function () {
	const DOM_ATTRIBUTE = "lnFileAccess";
	const STORAGE_KEY = "app:folderHandle";

	if (window[DOM_ATTRIBUTE]) return;

	let folderHandle = null;

	function constructor(root) {
		_restoreHandle();
		_bindEvents();
	}

	// Restore from idb
	async function _restoreHandle() {
		try {
			const saved = await idbKeyval.get(STORAGE_KEY);
			if (saved && saved.kind === "directory") {
				folderHandle = saved;
				console.log("📂 Restored folder handle:", folderHandle.name);
			}
		} catch (err) {
			console.warn("⚠ Failed to restore folder handle:", err);
		}
	}

	// Save to idb
	async function _saveHandle(handle) {
		try {
			await idbKeyval.set(STORAGE_KEY, handle);
			console.log("💾 Folder handle saved:", handle.name);
		} catch (err) {
			console.warn("⚠ Failed to save folder handle:", err);
		}
	}

	function _bindEvents() {
		document.addEventListener("folder:select", e => {
			if (e.detail?.handle) {
				folderHandle = e.detail.handle;
				_saveHandle(folderHandle);
			}
		});
	}

	// API
	constructor.getFolderHandle = () => folderHandle;

	constructor.getFileHandle = async (filename) => {
		if (!folderHandle) throw new Error("No folder handle set");
		return await folderHandle.getFileHandle(filename);
	};

	constructor.getFile = async (filename) => {
		const fileHandle = await constructor.getFileHandle(filename);
		return await fileHandle.getFile();
	};

	function _observeDomChanges() {
		new MutationObserver(muts => {
			muts.forEach(m =>
				m.addedNodes.forEach(node => {
					if (node.nodeType === 1) constructor(node);
				})
			);
		}).observe(document.body, { childList: true, subtree: true });
	}

	window[DOM_ATTRIBUTE] = constructor;
	constructor(document.body);
	_observeDomChanges();
})();
