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
		},
		{
			type: 'normal',
			contentHtml: '某算法竞赛社区用户动态发送累计数量动态演示 <a class="link" href="https://www.bilibili.com/video/BV1PL76zjEtE/">https://www.bilibili.com/video/BV1PL76zjEtE/</a>'
		},
		{
			type: 'warning',
			contentHtml: '在设置页面中设置关注列表后，可以设置关注列表批量抓取已关注用户（伪全网犇）。'
		},
		{
			type: 'warning',
			contentHtml: '<a class="link" href="https://sponsor.imken.moe">捐赠</a>帮助我们活下去！'
		},
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
