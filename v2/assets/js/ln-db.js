(function () {
	'use strict';

	var DOM_ATTRIBUTE = 'lnDb';

	if (window[DOM_ATTRIBUTE] !== undefined) return;

	var DB_NAME = 'lnDjMixer';
	var DB_VERSION = 1;
	var _db = null;
	var _opening = null;

	function open() {
		if (_db) return Promise.resolve(_db);
		if (_opening) return _opening;

		_opening = new Promise(function (resolve, reject) {
			var req = indexedDB.open(DB_NAME, DB_VERSION);

			req.onupgradeneeded = function (e) {
				var d = e.target.result;
				if (!d.objectStoreNames.contains('profiles')) {
					d.createObjectStore('profiles', { keyPath: 'id' });
				}
				if (!d.objectStoreNames.contains('settings')) {
					d.createObjectStore('settings', { keyPath: 'key' });
				}
			};

			req.onsuccess = function (e) {
				_db = e.target.result;
				resolve(_db);
			};

			req.onerror = function (e) {
				reject(e.target.error);
			};
		});

		return _opening;
	}

	function get(storeName, key) {
		return new Promise(function (resolve, reject) {
			var tx = _db.transaction(storeName, 'readonly');
			var store = tx.objectStore(storeName);
			var req = store.get(key);
			req.onsuccess = function () { resolve(req.result || null); };
			req.onerror = function () { reject(req.error); };
		});
	}

	function getAll(storeName) {
		return new Promise(function (resolve, reject) {
			var tx = _db.transaction(storeName, 'readonly');
			var store = tx.objectStore(storeName);
			var req = store.getAll();
			req.onsuccess = function () { resolve(req.result || []); };
			req.onerror = function () { reject(req.error); };
		});
	}

	function put(storeName, value) {
		return new Promise(function (resolve, reject) {
			var tx = _db.transaction(storeName, 'readwrite');
			var store = tx.objectStore(storeName);
			var req = store.put(value);
			req.onsuccess = function () { resolve(); };
			req.onerror = function () { reject(req.error); };
		});
	}

	function del(storeName, key) {
		return new Promise(function (resolve, reject) {
			var tx = _db.transaction(storeName, 'readwrite');
			var store = tx.objectStore(storeName);
			var req = store.delete(key);
			req.onsuccess = function () { resolve(); };
			req.onerror = function () { reject(req.error); };
		});
	}

	window[DOM_ATTRIBUTE] = {
		open: open,
		get: get,
		getAll: getAll,
		put: put,
		delete: del
	};
})();
