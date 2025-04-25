<script lang="ts">
	import MdiLinkVariant from '~icons/mdi/link-variant';
	import MdiReply from '~icons/mdi/reply';
	import MdiShareVariant from '~icons/mdi/share-variant';
	import MdiCodeTags from '~icons/mdi/code-tags';

	import MarkdownIt from 'markdown-it';
	import { settings } from '../store/settings';
	import bilibiliPlugin from '$lib/markdown/bilibili';

	import { copyText } from '$lib';
	import { addNotification } from '$lib/state/notifications';
	import { onMount } from 'svelte';

	import { showMarkdownDialog, showShareDialog } from '$lib/state/dialog';

	export let id: number, username: string, time: string, content: string, grabTime: string;
	export let userId: number,
		join: boolean = false;
	export let fit = false;

	let contentElement: HTMLDivElement;

	onMount(() => {
		origin = location.origin;
	});

	let benben: HTMLDivElement;

	let markdownRenderer = new MarkdownIt();
	// if (settings.markdownOptions.bilibili) markdownRenderer.use(bilibiliPlugin);

	$: if ($settings && $settings.markdownOptions.bilibili) {
		markdownRenderer = new MarkdownIt().use(bilibiliPlugin);
	}
</script>

<div
	class="card card-border card-sm text-wrap break-words {join && 'join-item'} {fit && 'h-full'}"
	bind:this={benben}
>
	<div class="card-body">
		<div class="flex">
			<div class="avatar mr-3 flex-none">
				<div class="h-10 w-10 rounded-full">
					<img
						alt="{username} 的头像"
						class="not-prose"
						src="https://cdn.luogu.com.cn/upload/usericon/{userId}.png"
					/>
				</div>
			</div>
			<div class="flex-1 leading-5">
				<a href="/user/{userId}" class="link link-hover text-sm">
					{username}
				</a>
				<br /><span class="text-xs" style="color: 0xcccccc;">
					发送于 {new Date(time).toLocaleString()}，保存于
					{new Date(grabTime).toLocaleString()}
				</span>
			</div>
		</div>

		<div class="prose max-w-full text-sm" bind:this={contentElement}>
			{@html markdownRenderer.render(content)}
		</div>

		<div class="card-actions text-xs">
			<a class="link-hover" href="/feed/{id}">#{id}</a>
			<a class="link-hover" href="/feed/{id}">
				<MdiLinkVariant class="inline" /> 永久链接
			</a>
			<a
				href="?"
				class="link link-hover inline"
				on:click|preventDefault={() => {
					copyText(` || @${username} : ${contentElement.innerText}`);
					addNotification('success', '回复文本已复制！');
				}}
			>
				<MdiReply class="inline" /> 回复
			</a>
			<a
				href="?"
				class="link link-hover inline"
				on:click|preventDefault={() => showShareDialog(id, benben)}
			>
				<MdiShareVariant class="inline" /> 分享
			</a>
			<a
				href="?"
				class="link link-hover"
				on:click|preventDefault={() => showMarkdownDialog(id, content)}
			>
				<MdiCodeTags class="inline" /> 查看 Markdown 源码
			</a>
			<span class="flex-grow"></span>
		</div>
	</div>
</div>

<style scoped>
	:global(.prose a) {
		color: cadetblue;
	}

	:global(.prose img) {
		max-width: 100%;
		max-height: 500px;
	}
</style>
