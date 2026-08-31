<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { createFetcher } from '$lib';
	import MdiCubeScan from '~icons/mdi/cube-scan';
	import MdiHours24 from '~icons/mdi/hours-24';
	import MdiServer from '~icons/mdi/server';
	import { setTitle } from '$lib/state/title';
	import Advertising from '$lib/components/Advertising.svelte';
	import { createDiagnosticQuery } from '$lib/query';
	import PageTitle from '$lib/components/PageTitle.svelte';

	const stat = createQuery<API.Stat>({
		queryKey: ['/statistics'],
		queryFn: createFetcher(`/statistics`),
		refetchInterval: 10000
	});

	const diagnostic = createDiagnosticQuery();

	setTitle('首页');
</script>

<div class="mx-auto max-w-5xl px-4">
	<PageTitle title="犇站看板" subtitle="Kanban" />

	<div class="mb-10">
		<div class="grid grid-cols-1 gap-8 md:grid-cols-2">
			<div>
				<div
					class="mb-3 flex items-center gap-1.5 text-sm font-medium tracking-wide uppercase opacity-60"
				>
					<MdiCubeScan class="text-primary" />
					累计保存的犇犇
				</div>
				{#if $stat.isLoading}
					<span class="loading loading-ring loading-lg"></span>
				{:else if $stat.isSuccess}
					<div class="text-primary text-6xl font-light tracking-tighter tabular-nums">
						{$stat.data.total_count.toLocaleString()}
					</div>
					<div class="mt-2 text-xs opacity-40">
						{new Date('2023/07/01 13:05').toLocaleDateString()} — {new Date().toLocaleDateString()}
					</div>
				{:else}
					<span class="text-error text-base">加载失败</span>
				{/if}
			</div>

			<div>
				<div
					class="mb-3 flex items-center gap-1.5 text-sm font-medium tracking-wide uppercase opacity-60"
				>
					<MdiHours24 class="text-info" />
					近 24 小时新增
				</div>
				{#if $stat.isLoading}
					<span class="loading loading-ring loading-lg"></span>
				{:else if $stat.isSuccess}
					<div class="text-info text-6xl font-light tracking-tighter tabular-nums">
						--,---
					</div>
					<div class="mt-2 text-xs opacity-40">
						截至 {new Date().toLocaleString()}
					</div>
				{:else}
					<span class="text-error text-base">加载失败</span>
				{/if}
			</div>
		</div>

		<div class="mt-6 flex items-center gap-1.5 text-xs opacity-60">
			<MdiServer />
			后端服务状态
			{#if $diagnostic.isLoading}
				<span class="loading loading-ring loading-xs"></span>
			{:else if $diagnostic.isSuccess}
				{@const up = $diagnostic.data.database === 'up' && $diagnostic.data.redis === 'up'}
				<span class={up ? 'text-success' : 'text-error'}>{up ? '正常' : '离线'}</span>
			{:else}
				未知
			{/if}
		</div>
	</div>

	<div>
		<h2 class="border-base-200 mb-4 border-b pb-1 text-base font-semibold">广告</h2>
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<Advertising />
		</div>
	</div>
</div>
