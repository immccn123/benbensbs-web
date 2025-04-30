<!-- svelte-ignore event_directive_deprecated -->

<script lang="ts">
	import { createFetcher } from '$lib';
	import { createInfiniteQuery } from '@tanstack/svelte-query';
	import SveltyPicker from 'svelty-picker';
	import Benben from '$lib/components/Benben.svelte';
	import { goto } from '$app/navigation';
	import MdiCommentAlert from '~icons/mdi/comment-alert';
	import MdiSearch from '~icons/mdi/search';
	import MdiMoreHoriz from '~icons/mdi/more-horiz';
	import Ad from '$lib/components/Ad.svelte';
	import { setTitle } from '$lib/state/title';

	let { data } = $props();

	let keyword: string = $state(data.keyword ?? '');
	let senderText: string = $state(data.senderText ?? '');
	let dateBefore: string = $state(data.dateBefore ?? '');
	let dateAfter: string = $state(data.dateAfter ?? '');
	let results: API.Benben[] = $state([]);

	$effect(() => {
		if (data.keyword) setTitle(`检索 ${data.keyword} 的结果`);
		else setTitle(`检索`);
	});

	$effect(() => {
		results = queryData ?? [];
	});

	const params = (search: boolean = false, loadMore = false) => {
		const queryParams = [];
		if (keyword) queryParams.push(`keyword=${encodeURIComponent(keyword)}`);
		if (senderText) {
			const senders = senderText.split(',').map((x) => +x.trim());
			senders.forEach((value) => queryParams.push(`senders=${value}`));
		}
		if (dateBefore)
			queryParams.push(
				`date_before=${!search ? new Date(dateBefore).getTime() * 1000 : dateBefore}`
			);
		if (dateAfter)
			queryParams.push(
				`date_after=${!search ? new Date(dateAfter).getTime() * 1000 : dateAfter}`
			);
		if (!search && loadMore && results.length)
			queryParams.push(`id_after=${results.slice(-1)[0].id}`);
		return queryParams.join('&');
	};

	const query = createInfiniteQuery<API.Benben[]>({
		queryKey: ['searchResults', data.keyword, data.dateBefore, data.senderText, data.dateAfter],
		queryFn: async ({ pageParam }) =>
			createFetcher<API.Benben[]>(`/search/db?${params(false, pageParam as boolean)}`)(),
		getNextPageParam: (lastPage) => (lastPage.length === 50 ? true : undefined),
		initialPageParam: false,
		refetchInterval: 0,
		refetchOnMount: false,
		refetchIntervalInBackground: false,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false
	});

	let queryData = $derived($query.data?.pages.flat());
	let isFetching = $derived($query.isFetching);
	let isLoading = $derived($query.isLoading || $query.isRefetching);

	const loadMore = async () => {
		$query.fetchNextPage();
	};

	const searchHandler = () => {
		goto(`/search?${params(true)}`);
		queryData && (queryData.length = 0);
		$query.refetch();
	};
</script>

<div class="container mx-auto">
	<h2 class="mb-2 text-2xl">犇犇检索</h2>

	<div class="my-2 w-full">
		<form on:submit|preventDefault={searchHandler}>
			<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<div>
					<div class="label">
						<span class="label-text">子串</span>
					</div>
					<input type="text" bind:value={keyword} class="input input-bordered w-full" />
				</div>

				<div>
					<div class="label">
						<span class="label-text">发送人 UID</span>
					</div>
					<input
						type="text"
						bind:value={senderText}
						placeholder="半角逗号分隔，例如 1,114514,3698"
						class="input input-bordered w-full"
					/>
				</div>

				<div>
					<div class="label">
						<span class="label-text">起始时间</span>
					</div>
					<SveltyPicker
						bind:value={dateAfter}
						inputClasses="input input-bordered w-full"
						displayFormat="yyyy-mm-dd hh:ii"
						format="yyyy-mm-dd hh:ii"
						mode="datetime"
						placeholder="留空不作约束"
					/>
				</div>

				<div>
					<div class="label">
						<span class="label-text">终止时间</span>
					</div>
					<SveltyPicker
						bind:value={dateBefore}
						inputClasses="input input-bordered w-full"
						displayFormat="yyyy-mm-dd hh:ii"
						format="yyyy-mm-dd hh:ii"
						mode="datetime"
						placeholder="留空不作约束"
					/>
				</div>
			</div>

			<button
				class="btn md:btn-sm mt-2 w-full"
				on:click={searchHandler}
				disabled={isFetching || isLoading}
			>
				<MdiSearch /> 搜索
			</button>
		</form>
	</div>

	<div>
		{#if isLoading}
			<div class="text-center">
				<span class="loading loading-ring loading-lg"></span>
				<br />
				少女祈祷中
			</div>
		{:else}
			<div class="join join-vertical w-full">
				{#each results as result, i (result.id)}
					<Benben join {...result} />
					{#if (i + 1) % 15 === 0}
						<Ad join flow />
					{/if}
				{/each}
				{#if $query.hasNextPage}
					<button
						class="btn join-item my-2 w-full"
						on:click={loadMore}
						disabled={isFetching}
					>
						{#if isFetching}
							<span class="loading loading-ring"></span>
							少女祈祷中……
						{:else}
							<MdiMoreHoriz /> 加载更多
						{/if}
					</button>
				{:else}
					<div class={['alert my-2 w-full', results.length !== 0 && 'join-item']}>
						<MdiCommentAlert /> 似乎没有更多信息了 {'w(ﾟДﾟ)w'}
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>

<style scoped>
	:global(.sdt-component-wrap) {
		width: 100%;
	}
</style>
