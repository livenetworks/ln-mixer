import { defineConfig } from 'vite';
import { resolve } from 'path';

// Vendor build — bundles a SUBSET of ln-ashlar (only the components ln-mixer uses)
// from the @livenetworks/ashlar npm package (node_modules) into our own assets/.
// The component allowlist lives in assets/js/ln-ashlar.entry.js. That entry imports
// no SCSS, so there is no CSS sidecar to drop — ln-ashlar styles are compiled
// separately via assets/scss/app.scss (which @use's the matching SCSS subset).
// Output: assets/js/ln-ashlar.build.js
export default defineConfig({
	build: {
		emptyOutDir: false,
		outDir: resolve(__dirname, 'assets/js'),
		lib: {
			entry: resolve(__dirname, 'assets/js/ln-ashlar.entry.js'),
			name: 'LnAshlar',
			formats: ['es'],
			fileName: () => 'ln-ashlar.build.js'
		}
	}
});
