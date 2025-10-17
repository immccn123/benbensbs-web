<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import Benben from '$lib/components/Benben.svelte';
	import MdiRefresh from '~icons/mdi/refresh';
	import { createFetcher } from '$lib';
	import MdiCubeScan from '~icons/mdi/cube-scan';
	import MdiHours24 from '~icons/mdi/hours-24';
	import { setTitle } from '$lib/state/title';
	import Advertising from '$lib/components/Advertising.svelte';
	import { addSpiderTask } from '$lib/query/spider';

	const stat = createQuery<API.Stat>({
		queryKey: ['/statistics'],
		queryFn: createFetcher(`/statistics`),
		refetchInterval: 10000
	});

	const randomBenben = createQuery<API.Benben>({
		queryKey: ['/tools/getRandom'],
		queryFn: createFetcher(`/tools/getFeed/6661469`),
		refetchOnMount: false,
		refetchOnReconnect: false,
		refetchOnWindowFocus: false
	});

	let uid = '';
	let isFetching = false;

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

	<h2 class="text-xl">
		随机犇犇 <button
			class="btn btn-xs w-24"
			disabled={$randomBenben.isRefetching}
			on:click={() => $randomBenben.refetch()}
		>
			{#if $randomBenben.isRefetching}
				<span class="loading loading-ring loading-xs"></span>
			{:else if $randomBenben.isSuccess}
				<MdiRefresh /> 换一个！
			{/if}
		</button>
	</h2>
	<div class="row-auto grid grid-flow-row items-stretch gap-2 lg:grid-cols-4">
		<div class="h-full lg:col-span-2">
			{#if $randomBenben.isLoading}
				<div class="card card-sm card-border">
					<div class="card-body">
						<div class="flex">
							<div class="avatar mr-3 flex-none">
								<div class="skeleton h-10 shrink-0 rounded-full"></div>
							</div>
							<div class="grid flex-1 gap-1 leading-5">
								<div class="skeleton h-4 w-56"></div>
								<div class="skeleton h-4 w-56"></div>
							</div>
						</div>
						<div class="skeleton h-12 w-full"></div>
					</div>
				</div>
			{:else if $randomBenben.isSuccess}
				<Benben {...$randomBenben.data} />
			{/if}
			<h2 class="my-2 text-xl">添加抓取任务</h2>
			<div class="join w-full">
				<input
					type="number"
					placeholder="UID"
					bind:value={uid}
					class="input join-item input-bordered w-full"
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
		<div class="lg:col-span-2">
			<Advertising />
		</div>
	</div>
</div>
