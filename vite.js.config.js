import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
	resolve: {
		alias: {
			'ln-ashlar': resolve(__dirname, 'ln-ashlar')
		}
	},
	build: {
		emptyOutDir: false,
		outDir: resolve(__dirname, 'assets/js'),
		lib: {
			entry: resolve(__dirname, 'assets/js/main.js'),
			formats: ['es'],
			fileName: () => 'main.build.js'
		},
		rollupOptions: {
			external: []
		}
	}
});
