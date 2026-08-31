<script lang="ts">
	import { onMount } from 'svelte';
	import {
		checkAllSequential,
		type CategoryCheckResult,
		type ProbeResult
	} from '$lib/config/check';
	import { setApiBase, setSpiderBase, resetLineOverrides } from '$lib/config/base';
	import { addNotification } from '$lib/state/notifications';
	import MdiRefresh from '~icons/mdi/refresh';
	import MdiSwapHorizontal from '~icons/mdi/swap-horizontal';

	let loading = false;
	let categories: CategoryCheckResult[] = [];
	let hasRun = false;
	let cancelled = false;

	const hostname = (url: string) => {
		try {
			return new URL(url).hostname;
		} catch {
			return url;
		}
	};

	async function run() {
		if (loading) return;
		cancelled = false;
		loading = true;
		hasRun = true;
		try {
			await checkAllSequential(
				(states) => {
					categories = [...states];
				},
				() => cancelled
			);
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		void run();
		return () => {
			cancelled = true;
		};
	});

	function switchTo(c: CategoryCheckResult, url: string) {
		if (c.kind === 'frontend') {
			location.href = url + location.pathname + location.search + location.hash;
			return;
		}

		if (c.kind === 'api') {
			setApiBase(url);
			addNotification('success', `已切换 API 线路至 ${hostname(url)}`);
		} else {
			setSpiderBase(url);
			addNotification('success', `已切换爬虫线路至 ${hostname(url)}`);
		}

		c.current = url;
		for (const result of c.results) result.isCurrent = result.line.url === url;
		const index = c.results.findIndex((result) => result.line.url === url);
		if (index > 0) {
			const [currentResult] = c.results.splice(index, 1);
			c.results.unshift(currentResult);
		}
		categories = [...categories];
	}

	function reset() {
		resetLineOverrides();
		addNotification('success', '已恢复默认线路');
		void run();
	}

	const isBest = (c: CategoryCheckResult, r: ProbeResult) => c.best === r;

	function rowClass(r: ProbeResult) {
		if (!r.ok && !r.pending && !r.isCurrent) return 'opacity-50 grayscale';
		return '';
	}

	function borderClass(c: CategoryCheckResult, r: ProbeResult) {
		if (r.isCurrent && !r.ok && !r.pending) return 'border-l-4 border-l-error';
		if (isBest(c, r)) return 'border-l-4 border-l-success';
		if (r.isCurrent) return 'border-l-4 border-l-primary';
		return '';
	}
</script>

<p class="mb-3 text-sm opacity-70">
	注意：切换前端线路将跳转到对应站点。网络存在波动，测试结果每次不一定相同。选定一个不建议再改。
</p>

<div class="mb-4 flex flex-wrap gap-2">
	<button class="btn btn-primary btn-sm" on:click={run} disabled={loading}>
		{#if loading}
			<span class="loading loading-spinner loading-sm"></span>
		{:else}
			<MdiRefresh />
		{/if}
		{hasRun && !loading ? '重新检测' : '检测中'}
	</button>
	<button class="btn btn-ghost btn-sm" on:click={reset} disabled={loading}>恢复默认线路</button>
</div>

{#if hasRun}
	<div class="flex flex-col gap-4">
		{#each categories as c (c.kind)}
			<div>
				<div class="overflow-x-auto">
					<table class="table-sm table">
						<thead>
							<tr>
								<th>线路</th>
								<th>延迟</th>
								<th></th>
							</tr>
						</thead>
						<tbody>
							{#each c.results as r (r.line.url)}
								<tr class={rowClass(r)}>
									<td class={borderClass(c, r)}>
										<div class="flex items-center gap-1">
											<span>{r.line.name}</span>
											{#if r.isCurrent}
												<span class="badge badge-ghost badge-sm">当前</span>
											{/if}
											{#if isBest(c, r)}
												<span class="badge badge-success badge-sm"
													>最快</span
												>
											{/if}
										</div>
										<div class="text-xs opacity-50">{hostname(r.line.url)}</div>
									</td>
									<td>
										{#if r.pending}
											<span class="loading loading-dots loading-xs"></span>
										{:else if r.latency !== null}
											<span class="font-mono text-sm">{r.latency}ms</span>
										{:else}
											<span class="text-xs opacity-40">—</span>
										{/if}
									</td>
									<td class="text-right">
										{#if r.ok && !r.isCurrent}
											<button
												class="btn btn-primary btn-xs"
												on:click={() => switchTo(c, r.line.url)}
											>
												<MdiSwapHorizontal />
												{c.kind === 'frontend' ? '前往' : '切换'}
											</button>
										{/if}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		{/each}
	</div>
{/if}
