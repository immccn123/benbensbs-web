<script lang="ts">
	import { createHistoryUsernameQuery } from '$lib/query';
	import MdiCommentAlert from '~icons/mdi/comment-alert';
	import { initialUid } from '../../../store.js';
	import { createQuery } from '@tanstack/svelte-query';
	import { createFetcher } from '$lib';
	import Heatmap from '$lib/components/Heatmap.svelte';

	export let data;

	$: historyUsernames = createHistoryUsernameQuery(+data.id);
	$: heatmap = createQuery<API.Heatmap>({
		queryKey: [`/tools/heatmap/${$initialUid}`],
		queryFn: createFetcher(`/tools/heatmap/${$initialUid}`),
		refetchOnMount: true,
		refetchOnReconnect: false,
		refetchOnWindowFocus: false
	});
</script>

<div class="mt-3 grid gap-3">
	<div class="mx-auto text-center">
		<div>
			<div class="avatar w-45 border-xl rounded-full">
				<img
					alt="{$initialUid} 的头像"
					class="not-prose"
					src="https://cdn.luogu.com.cn/upload/usericon/{$initialUid}.png"
				/>
			</div>
		</div>

		{#if $historyUsernames.isLoading}
			<div class="loading loading-ring loading-lg"></div>
		{:else if $historyUsernames.isSuccess}
			{#if $historyUsernames.data.length === 0}
				<div class="alert">
					<MdiCommentAlert /> 这里暂时没有 TA 的信息呢
				</div>
			{:else}
				<ul>
					<li class="text-lg">
						<pre><code>{$historyUsernames.data.join(' / ')}</code></pre>
					</li>
				</ul>
			{/if}
		{/if}
	</div>

	<div class="overflow-x-auto">
		<h2 class="mb-2 text-xl">热力图</h2>
		<div class="card card-border">
			<div class="card-body w-full overflow-x-auto">
				{#if $heatmap.isLoading}
					<div class="loading loading-ring loading-lg"></div>
				{:else}
					<Heatmap data={$heatmap.data} />
				{/if}
			</div>
		</div>
	</div>
</div>
