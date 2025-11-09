<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { createFetcher } from '$lib';
	import MdiCubeScan from '~icons/mdi/cube-scan';
	import MdiHours24 from '~icons/mdi/hours-24';
	import { setTitle } from '$lib/state/title';
	import Advertising from '$lib/components/Advertising.svelte';
	import { addSpiderTask, addSpiderTasks } from '$lib/query/spider';
	import Ad from '$lib/components/Ad.svelte';
	import { settings } from '$lib/store/settings';

	const stat = createQuery<API.Stat>({
		queryKey: ['/statistics'],
		queryFn: createFetcher(`/statistics`),
		refetchInterval: 10000
	});

	let uid = '';
	let isFetching = false;

	$: followingUsers = $settings?.followedUsers ?? [];

	setTitle('首页');
</script>

<div class="container mx-auto grid gap-4">
	<h1 class="text-2xl">首页</h1>
	<div>
		<h2 class="mb-2 text-xl">统计数据</h2>
		<div class="stats max-sm:stats-vertical w-full">
			<div class="stat">
				<div class="stat-figure text-secondary"></div>
				<div class="stat-title">累计保存的犇犇</div>
				<div class="stat-figure text-primary"><MdiCubeScan /></div>
				<div class="stat-value text-primary">
					{#if $stat.isLoading}
						<span class="loading loading-ring loading-lg"></span>
					{:else if $stat.isSuccess}
						{$stat.data.total_count.toLocaleString()}
					{/if}
				</div>
				<div class="stat-desc">
					{new Date('2023/07/01 13:05').toLocaleDateString()} - {new Date().toLocaleDateString()}
				</div>
			</div>

			<div class="stat">
				<div class="stat-figure text-secondary"></div>
				<div class="stat-title">近 24 小时内共计保存</div>
				<div class="stat-figure text-secondary"><MdiHours24 /></div>
				<div class="stat-value text-secondary">
					{#if $stat.isLoading}
						<span class="loading loading-ring loading-lg"></span>
					{:else if $stat.isSuccess}
						{$stat.data.today_count.toLocaleString()}
					{/if}
				</div>
				<div class="stat-desc">截至 {new Date().toLocaleString()}</div>
			</div>
		</div>
	</div>

	<h2 class="text-xl">添加抓取任务</h2>
	<div class="flex items-center gap-2">
		<div class="flex-1">
			<div class="join w-full">
				<input
					type="number"
					placeholder="UID"
					bind:value={uid}
					class="input join-item input-bordered flex-1"
				/>
				<button
					class="btn join-item"
					on:click={() => {
						isFetching = true;
						addSpiderTask(uid).finally(() => (isFetching = false));
					}}
					disabled={isFetching}
				>
					抓取
				</button>
			</div>
		</div>
		<div class="divider divider-horizontal my-0">或者</div>
		<div class="flex-1">
			<button
				class="btn tooltip rounded-box w-full"
				data-tip="前往设置（左下角）可设置关注列表"
				disabled={isFetching}
				on:click={() => {
					isFetching = true;
					addSpiderTasks(followingUsers).finally(() => (isFetching = false));
				}}
			>
				抓取关注用户
			</button>
		</div>
	</div>

	<h2 class="text-xl">赞助商广告</h2>
	<div class="row-auto grid grid-flow-row items-stretch gap-2 lg:grid-cols-4">
		<div class="h-full lg:col-span-2">
			<div>
				<Ad />
			</div>
		</div>
		<div class="lg:col-span-2">
			<Advertising />
		</div>
	</div>
</div>
