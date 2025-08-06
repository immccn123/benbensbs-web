<!-- svelte-ignore event_directive_deprecated -->

<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import chance from 'chance';

	type Ad = {
		src: string;
		alt: string;
		href: string;
	};

	const trending: Ad[] = [];

	const items: Ad[] = Array.prototype.concat(
		trending,
		chance(new Date().toDateString()).shuffle([
			{
				src: '/advertising.webp',
				alt: '广告位招租',
				href: 'https://qm.qq.com/q/f2Wp6MF5lu'
			},
			{
				src: 'https://static.imken.moe/bensite-advertising/sleepingcup.webp',
				alt: 'Sleeping Cup',
				href: 'http://8.136.99.126'
			},
			{
				src: 'https://static.imken.moe/bensite-advertising/test8.webp',
				alt: 'OIer 观测者交流群 群号 946034915',
				href: 'https://qm.qq.com/q/dAxBet1PE'
			},
			{
				src: 'https://static.imken.moe/bensite-advertising/MC%20服务器广告画制作.webp',
				alt: 'zhengddzz 的 mc 服务器玩家交流群',
				href: 'https://qm.qq.com/q/k6L0rbtywg'
			}
		])
	);

	let activeItem = 0;
	let interval: number | NodeJS.Timeout;

	function switcher() {
		activeItem = (activeItem + 1) % items.length;
	}

	function resetInterval() {
		if (interval) clearInterval(interval);
		interval = setInterval(switcher, 5000);
	}

	onMount(() => {
		resetInterval();
	});
</script>

<div class="carousel w-full">
	{#each items as item, index (item.src)}
		{#if index === activeItem}
			<div
				class="carousel-item sticky left-0 top-0 w-full"
				out:fade={{ duration: 100 }}
				in:fade={{ delay: 100 }}
			>
				<a href={item.href} target="_blank" rel="nofollow noreferrer noopener">
					<img src={item.src} alt={item.alt} class="w-full" />
				</a>
			</div>
		{/if}
	{/each}
</div>

<!-- 每 24h 随机打乱一次！ -->
<div class="flex w-full justify-center gap-2 py-2">
	{#each items as _, index}
		<a
			href="?"
			on:click|preventDefault={() => ((activeItem = index), resetInterval())}
			class="btn btn-xs {activeItem === index && 'btn-primary'}"
		>
			{index + 1}
		</a>
	{/each}
</div>
