import { mdsvex } from 'mdsvex';
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { optimizeImports } from "carbon-preprocess-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: [
    vitePreprocess(), 
    optimizeImports(), 
    mdsvex()
  ],

	kit: {
		adapter: adapter({fallback: '200.html'})
	},

	extensions: ['.svelte', '.svx']
};

export default config;
