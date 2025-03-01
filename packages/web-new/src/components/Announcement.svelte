<script lang="ts">
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import MdiAnnouncement from '~icons/mdi/announcement';

	type Announcement = {
		type: 'normal' | 'error' | 'success' | 'warning';
		contentHtml: string;
	};

	const items: Announcement[] = [
		{
			type: 'normal',
			contentHtml: '欢迎加入我们的用户讨论群！QQ 群号：313404608'
		}
	];

	let activeItemId = 0;
	let interval: number | NodeJS.Timeout;
	$: activeItem = items[activeItemId];

	function switcher() {
		activeItemId = (activeItemId + 1) % items.length;
	}

	function resetInterval() {
		if (interval) clearInterval(interval);
		interval = setInterval(switcher, 5000);
	}

	onMount(() => {
		resetInterval();
	});
</script>

{#if activeItem !== undefined}
	<div class="h-16 overflow-hidden">
		{#key activeItemId}
			<div
				role="alert"
				class="alert m-3 alert-{activeItem.type} relative left-0 top-0"
				out:fly={{ duration: 100, y: 24 }}
				in:fly={{ delay: 100, y: -24 }}
			>
				<div>
					<MdiAnnouncement class="inline text-lg" /> ({activeItemId + 1}/{items.length}) {@html activeItem.contentHtml}
				</div>
			</div>
		{/key}
	</div>
{/if}
