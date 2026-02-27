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
	   HYDRATE / APPLY (no DB — coordinator handles persistence)
	   ==================================================================== */

	function hydrate(record) {
		if (record) {
			if (record.apiUrl !== undefined) _settings.apiUrl = record.apiUrl;
			if (record.brandLogo !== undefined) _settings.brandLogo = record.brandLogo;
		}
		_applyBranding();
		window.dispatchEvent(new CustomEvent('ln-settings:loaded', {
			detail: { apiUrl: _settings.apiUrl, brandLogo: _settings.brandLogo }
		}));
	}

	function apply(data) {
		if (data.apiUrl !== undefined) _settings.apiUrl = data.apiUrl;
		if (data.brandLogo !== undefined) _settings.brandLogo = data.brandLogo;

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
		hydrate: hydrate,
		apply: apply,
		getApiUrl: getApiUrl,
		getBrandLogo: getBrandLogo
	};
})();
