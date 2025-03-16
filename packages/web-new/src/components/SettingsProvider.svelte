<script lang="ts">
	import { onMount } from 'svelte';
	import { settings, revalidateSettings } from '../store/settings';

	onMount(() => {
		const listener = () => revalidateSettings();
		window.addEventListener('focus', listener);

		return () => window.removeEventListener('focus', listener);
	});

	settings.subscribe((value) => {
		typeof localStorage !== 'undefined' &&
			localStorage.setItem('settings', JSON.stringify(value));
	});
</script>
