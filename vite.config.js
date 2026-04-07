import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
	root: '.',
	publicDir: 'public',
	resolve: {
		alias: {
			'ln-acme': resolve(__dirname, 'ln-acme')
		}
	},
	server: {
		proxy: {
			'/api': {
				target: 'http://ln-mixer.test',
				changeOrigin: true
			},
			'/music': {
				target: 'http://ln-mixer.test',
				changeOrigin: true
			}
		}
	},
	build: {
		outDir: 'dist',
		rollupOptions: {
			input: resolve(__dirname, 'index.html')
		}
	}
});
