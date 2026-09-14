<script lang="ts">
	import '../app.css';

	import { QueryClientProvider } from '@tanstack/svelte-query';
	import HeadTitle from '$lib/components/HeadTitle.svelte';
	import Footer from '$lib/components/Footer.svelte';

	import { pwaInfo } from 'virtual:pwa-info';

	const webManifestLink = pwaInfo ? pwaInfo.webManifest.linkTag : '';
</script>

<svelte:head>
	{@html webManifestLink}
</svelte:head>

<HeadTitle />
<div class="flex min-h-screen flex-col">
	<main class="flex-1">
		<slot />
	</main>
	<QueryClientProvider>
		<Footer />
	</QueryClientProvider>
</div>
