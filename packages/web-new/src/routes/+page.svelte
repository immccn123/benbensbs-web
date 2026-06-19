<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { createFetcher } from '$lib';
	import MdiCubeScan from '~icons/mdi/cube-scan';
	import MdiHours24 from '~icons/mdi/hours-24';
	import MdiDatabase from '~icons/mdi/database';
	import MdiServer from '~icons/mdi/server';
	import MdiCheckCircle from '~icons/mdi/check-circle';
	import MdiCloseCircle from '~icons/mdi/close-circle';
	import MdiAccountGroup from '~icons/mdi/account-group';
	import { setTitle } from '$lib/state/title';
	import Advertising from '$lib/components/Advertising.svelte';
	import { addSpiderTask, addSpiderTasks } from '$lib/query/spider';
	import Ad from '$lib/components/Ad.svelte';
	import { settings } from '$lib/store/settings';
	import { createDiagnosticQuery } from '$lib/query';
	import PageTitle from '$lib/components/PageTitle.svelte';

	const stat = createQuery<API.Stat>({
		queryKey: ['/statistics'],
		queryFn: createFetcher(`/statistics`),
		refetchInterval: 10000
	});

	const diagnostic = createDiagnosticQuery();

	let uid = '';
	let isFetching = false;

	$: followingUsers = $settings?.followedUsers ?? [];

	setTitle('首页');
</script>

<div class="mx-auto max-w-7xl px-6">
	<PageTitle title="犇站看板" subtitle="实时数据 · 抓取任务 · 服务状态" />
	<div class="mb-16 grid grid-cols-1 gap-12 md:grid-cols-2">
		<div>
			<div class="mb-4 flex items-center gap-2 text-sm font-medium tracking-wide uppercase">
				<MdiCubeScan class="text-primary" />
				<span class="opacity-60">累计保存的犇犇</span>
			</div>
			<div class="text-primary text-6xl font-light tracking-tighter">
				{#if $stat.isLoading}
					<span class="loading loading-ring loading-lg"></span>
				{:else if $stat.isSuccess}
					{$stat.data.total_count.toLocaleString()}
				{:else}
					<span class="text-error text-base">加载失败</span>
				{/if}
			</div>
			<div class="mt-3 text-xs opacity-40">
				{new Date('2023/07/01 13:05').toLocaleDateString()} — {new Date().toLocaleDateString()}
			</div>
		</div>
		<div>
			<div class="mb-4 flex items-center gap-2 text-sm font-medium tracking-wide uppercase">
				<MdiHours24 class="text-info" />
				<span class="opacity-60">近24小时新增</span>
			</div>
			<div class="text-info text-6xl font-light tracking-tighter">
				{#if $stat.isLoading}
					<span class="loading loading-ring loading-lg"></span>
				{:else if $stat.isSuccess}
					{$stat.data.today_count.toLocaleString()}
				{:else}
					<span class="text-error text-base">加载失败</span>
				{/if}
			</div>
			<div class="mt-3 text-xs opacity-40">
				截至 {new Date().toLocaleString()}
			</div>
		</div>
	</div>

	<div class="mb-16">
		<h2 class="border-base-200 mb-6 border-b pb-1 text-xl font-semibold">抓取任务</h2>
		<div class="grid grid-cols-1 gap-8 md:grid-cols-2">
			<div>
				<span class="mb-2 block text-sm font-medium">按 UID 抓取</span>
				<div class="flex gap-2">
					<input
						type="number"
						placeholder="例如 123456"
						bind:value={uid}
						class="input input-bordered focus:border-primary flex-1 transition-colors focus:outline-none"
						on:keypress={(e) =>
							e.key === 'Enter' &&
							uid &&
							!isFetching &&
							addSpiderTask(uid).finally(() => (isFetching = false))}
					/>
					<button
						class="btn btn-primary px-6"
						on:click={() => {
							if (uid) {
								isFetching = true;
								addSpiderTask(uid).finally(() => (isFetching = false));
							}
						}}
						disabled={isFetching || !uid}
					>
						{#if isFetching}<span class="loading loading-spinner loading-sm"
							></span>{/if}
						抓取
					</button>
				</div>
			</div>
			<div>
				<span class="mb-2 block text-sm font-medium">批量抓取关注用户</span>
				<div class="flex flex-col gap-2">
					<button
						class="btn btn-outline w-full justify-start gap-2 {followingUsers.length ===
						0
							? 'btn-disabled'
							: ''}"
						disabled={isFetching || followingUsers.length === 0}
						on:click={() => {
							isFetching = true;
							addSpiderTasks(followingUsers).finally(() => (isFetching = false));
						}}
					>
						<MdiAccountGroup />
						抓取关注用户
						{#if followingUsers.length > 0}
							<span class="badge badge-neutral ml-auto">{followingUsers.length}</span>
						{/if}
					</button>
				</div>
			</div>
		</div>
	</div>

	<div class="mb-16">
		<h2 class="border-base-200 mb-6 border-b pb-1 text-xl font-semibold">服务状态</h2>
		<div class="flex flex-wrap items-center gap-x-8 gap-y-4">
			<div class="flex items-center gap-3">
				<MdiDatabase class="opacity-70" />
				<span class="text-sm font-medium">数据库</span>
				{#if $diagnostic.isLoading}
					<span class="loading loading-ring loading-xs"></span>
				{:else if $diagnostic.isSuccess}
					{#if $diagnostic.data.database === 'up'}
						<span class="badge badge-success gap-1"><MdiCheckCircle /> 正常</span>
					{:else}
						<span class="badge badge-error gap-1"><MdiCloseCircle /> 离线</span>
					{/if}
				{:else}
					<span class="badge badge-ghost">未知</span>
				{/if}
			</div>
			<div class="flex items-center gap-3">
				<MdiServer class="opacity-70" />
				<span class="text-sm font-medium">Redis</span>
				{#if $diagnostic.isLoading}
					<span class="loading loading-ring loading-xs"></span>
				{:else if $diagnostic.isSuccess}
					{#if $diagnostic.data.redis === 'up'}
						<span class="badge badge-success gap-1"><MdiCheckCircle /> 正常</span>
					{:else}
						<span class="badge badge-error gap-1"><MdiCloseCircle /> 离线</span>
					{/if}
				{:else}
					<span class="badge badge-ghost">未知</span>
				{/if}
			</div>
		</div>
	</div>

	<div>
		<h2 class="border-base-200 mb-6 border-b pb-1 text-xl font-semibold">赞助商广告</h2>
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<Advertising />
			<Ad />
		</div>
	</div>
</div>
