<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import MdiCommentAlert from '~icons/mdi/comment-alert';
	import MdiRefresh from '~icons/mdi/refresh';
	import { settings } from '$lib/store/settings';
	import { createFetcher } from '$lib';
	import Benben from '$lib/components/Benben.svelte';
	import Ad from '$lib/components/Ad.svelte';
	import { addSpiderTasks } from '$lib/query/spider';

	$: followingUsers = $settings?.followedUsers ?? [];
	const benbens = createQuery<API.Benben[]>({
		queryKey: ['list'],
		queryFn: createFetcher<API.Benben[]>(`/list`),
		refetchInterval: false,
		refetchOnMount: false,
		refetchIntervalInBackground: false,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false
	});
</script>

<div class="container mx-auto">
	<h2 class="mb-2 text-2xl">
		伪全网犇

		<div class="join">
			<button
				class="btn btn-sm join-item"
				disabled={$benbens.isFetching}
				on:click={() => $benbens.refetch()}
			>
				{#if $benbens.isRefetching}
					<span class="loading loading-ring loading-xs"></span>
				{:else}
					<MdiRefresh />
				{/if}
				刷新
			</button>
			<button
				class="btn btn-sm join-item tooltip"
				data-tip="前往设置可设置关注列表"
				disabled={$benbens.isFetching}
				on:click={() => addSpiderTasks(followingUsers)}
			>
				请求抓取已关注用户
			</button>
		</div>
	</h2>

	<div class="mt-3">
		{#if $benbens.isLoading}
			<span class="loading loading-ring loading-lg"></span>
		{:else if $benbens.isSuccess}
			<div class="join join-vertical w-full overflow-hidden break-words">
				{#each $benbens.data as benben, i (benben.id)}
					<Benben {...benben} join />
					{#if (i + 1) % 15 === 0}
						<Ad join flow />
					{/if}
				{/each}
				<div class="alert join-item">
					<MdiCommentAlert /> 后面没有啦，你在期待什么（其实技术上没法做无尽信息流
				</div>
			</div>
		{/if}
	</div>
</div>
