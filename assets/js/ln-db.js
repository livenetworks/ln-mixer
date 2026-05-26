const DOM_ATTRIBUTE = 'lnDb';

if (!window[DOM_ATTRIBUTE]) {

	const KEY_MAPS = {
		settings: { from: 'key', to: 'id' },
		tracks: { from: 'url', to: 'id' },
		audioFiles: { from: 'url', to: 'id' }
	};

	function _toStoreFormat(storeName, value) {
		if (!value) return value;
		const map = KEY_MAPS[storeName];
		if (map) {
			const copy = Object.assign({}, value);
			copy[map.to] = copy[map.from];
			return copy;
		}
		return value;
	}

	function _fromStoreFormat(storeName, value) {
		if (!value) return value;
		const map = KEY_MAPS[storeName];
		if (map) {
			const copy = Object.assign({}, value);
			copy[map.from] = copy[map.to];
			return copy;
		}
		return value;
	}

	function _ensureStore(storeName) {
		return new Promise(function (resolve) {
			function check() {
				const el = document.querySelector('[data-ln-data-store="' + storeName + '"]');
				if (el) {
					const store = el.lnDataStore || el.lnStore;
					if (store) {
						resolve(store);
						return;
					}
				}
				setTimeout(check, 10);
			}
			check();
		});
	}

	function open() {
		if (document.readyState === 'loading') {
			return new Promise(function (resolve) {
				document.addEventListener('DOMContentLoaded', function () {
					resolve();
				});
			});
		}
		return Promise.resolve();
	}

	function get(storeName, key) {
		return _ensureStore(storeName).then(function (store) {
			return store.getById(key).then(function (record) {
				return _fromStoreFormat(storeName, record);
			});
		});
	}

	function getAll(storeName) {
		return _ensureStore(storeName).then(function (store) {
			return store.getAll().then(function (res) {
				const records = res ? res.data : [];
				return records.map(function (record) {
					return _fromStoreFormat(storeName, record);
				});
			});
		});
	}

	function getAllKeys(storeName) {
		return _ensureStore(storeName).then(function (store) {
			return store.getAll().then(function (res) {
				const records = res ? res.data : [];
				return records.map(function (record) {
					return record.id;
				});
			});
		});
	}

	function getAllByIndex(storeName, indexName, value) {
		return _ensureStore(storeName).then(function (store) {
			const filters = {};
			filters[indexName] = [value];
			return store.getAll({ filters: filters }).then(function (res) {
				const records = res ? res.data : [];
				return records.map(function (record) {
					return _fromStoreFormat(storeName, record);
				});
			});
		});
	}

	function deleteByIndex(storeName, indexName, value) {
		return _ensureStore(storeName).then(function (store) {
			const filters = {};
			filters[indexName] = [value];
			return store.getAll({ filters: filters }).then(function (res) {
				const records = res ? res.data : [];
				const ids = records.map(function (record) {
					return record.id;
				});
				if (ids.length === 0) return Promise.resolve();
				return store.applySync([], ids, Math.floor(Date.now() / 1000));
			});
		});
	}

	function put(storeName, value) {
		return _ensureStore(storeName).then(function (store) {
			const record = _toStoreFormat(storeName, value);
			return store.applySync([record], [], Math.floor(Date.now() / 1000));
		});
	}

	function del(storeName, key) {
		return _ensureStore(storeName).then(function (store) {
			return store.applySync([], [key], Math.floor(Date.now() / 1000));
		});
	}

	function clear(storeName) {
		return _ensureStore(storeName).then(function (store) {
			return store.fullReload();
		});
	}

	window[DOM_ATTRIBUTE] = {
		open: open,
		get: get,
		getAll: getAll,
		getAllKeys: getAllKeys,
		getAllByIndex: getAllByIndex,
		deleteByIndex: deleteByIndex,
		put: put,
		delete: del,
		clear: clear
	};

}

