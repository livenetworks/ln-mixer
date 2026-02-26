(function () {
	'use strict';

	var DOM_ATTRIBUTE = 'lnSettings';

	if (window[DOM_ATTRIBUTE] !== undefined) return;

	/* ====================================================================
	   STATE
	   ==================================================================== */

	var _settings = {
		apiUrl: '',
		brandLogo: ''
	};

	/* ====================================================================
	   DOM REFS (branding in topbar)
	   ==================================================================== */

	var _brand = null;
	var _brandLogo = null;

	function _cacheBrandDom() {
		_brand = document.querySelector('[data-ln-brand]');
		_brandLogo = document.querySelector('[data-ln-brand-logo]');
	}

	/* ====================================================================
	   BRANDING
	   ==================================================================== */

	function _applyBranding() {
		if (!_brand) _cacheBrandDom();
		if (!_brand) return;

		if (_settings.brandLogo) {
			_brand.hidden = false;
			_brandLogo.src = _settings.brandLogo;
		} else {
			_brand.hidden = true;
		}
	}

	/* ====================================================================
	   LOAD / SAVE (IndexedDB)
	   ==================================================================== */

	function load() {
		return lnDb.get('settings', 'app').then(function (record) {
			if (record) {
				if (record.apiUrl !== undefined) _settings.apiUrl = record.apiUrl;
				if (record.brandLogo !== undefined) _settings.brandLogo = record.brandLogo;
			}
			_applyBranding();
			window.dispatchEvent(new CustomEvent('ln-settings:loaded', {
				detail: { apiUrl: _settings.apiUrl, brandLogo: _settings.brandLogo }
			}));
		});
	}

	function save(data) {
		if (data.apiUrl !== undefined) _settings.apiUrl = data.apiUrl;
		if (data.brandLogo !== undefined) _settings.brandLogo = data.brandLogo;

		lnDb.put('settings', {
			key: 'app',
			apiUrl: _settings.apiUrl,
			brandLogo: _settings.brandLogo
		});

		_applyBranding();
		window.dispatchEvent(new CustomEvent('ln-settings:saved', {
			detail: { apiUrl: _settings.apiUrl, brandLogo: _settings.brandLogo }
		}));
	}

	/* ====================================================================
	   GETTERS
	   ==================================================================== */

	function getApiUrl() {
		return _settings.apiUrl;
	}

	function getBrandLogo() {
		return _settings.brandLogo;
	}

	/* ====================================================================
	   INIT
	   ==================================================================== */

	function _init() {
		_cacheBrandDom();
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', _init);
	} else {
		_init();
	}

	/* ====================================================================
	   PUBLIC API
	   ==================================================================== */

	window[DOM_ATTRIBUTE] = {
		load: load,
		save: save,
		getApiUrl: getApiUrl,
		getBrandLogo: getBrandLogo
	};
})();
