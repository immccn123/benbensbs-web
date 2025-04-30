import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import Icons from 'unplugin-icons/vite';

import { exec } from 'child_process';
import { promisify } from 'util';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';

import UnpluginTypia from '@ryoppippi/unplugin-typia/vite';

// Get current tag/commit and last commit date from git
const pexec = promisify(exec);
const [version, lastmod] = (
	await Promise.allSettled([
		pexec('git describe --tags || git rev-parse --short HEAD'),
		pexec('git log -1 --format=%cd --date=format:"%Y-%m-%d %H:%M:%S"')
	])
).map((x) => (x.status === 'fulfilled' ? x.value?.stdout.trim() : undefined));

export default defineConfig({
	plugins: [
		sveltekit(),
		Icons({ compiler: 'svelte' }),
		UnpluginTypia(),
		SvelteKitPWA({
			registerType: 'prompt',
			scope: '/',
			base: '/',
			manifest: {
				name: '犇站',
				short_name: '犇站',
				start_url: 'https://benben.sbs',
				display: 'standalone',
				lang: 'zh-cn',
				scope: '/',
				icons: [
					{ src: '/icon-192x192.png', sizes: '192x192' },
					{ src: '/icon-512x512.jpg', sizes: '512x512' }
				]
			},
			injectManifest: {
				globPatterns: [
					'client/**/*.{js,css,ico,png,svg,webp,webmanifest,ttf,woff,woff2}',
					'prerendered/**/*.{html,json}'
				]
			}
		})
	],
	define: {
		__VERSION__: `"${version}"`,
		__LASTMOD__: `"${lastmod}"`
	}
});
