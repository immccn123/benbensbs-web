<script lang="ts">
	import MarkdownIt from 'markdown-it';
	import policy from './legal/eol/policy.md?raw';
	import PageTitle from '$lib/components/PageTitle.svelte';
	import { setTitle } from '$lib/state/title';

	setTitle('已停止服务');

	const md = new MarkdownIt();
</script>

<div class="mx-auto max-w-2xl px-6 py-16">
	<PageTitle title="犇站已停止服务" subtitle="2023.07.01 — 2026.09.14" />

	<div class="space-y-4 text-sm leading-relaxed">
		<p>
			一些操作建议：<br /><br />
			<span class="font-medium">如果你是依赖犇站接口（查询、SSO、OLSI）提供服务的人</span
			>：接口会在 2026-09-21 前关闭，请尽快迁移或下线相关服务。<br />
			<span class="font-medium">如果你是普通访客</span>：无需进行任何操作。<br />
			<span class="font-medium">如果你需要自己的历史数据</span>：请在 2027-03-30
			数据库销毁前前往 OLSI（<a
				target="_blank"
				class="link link-primary"
				href="https://olsi.benben.sbs/export">https://olsi.benben.sbs/export</a
			>）下载个人数据。<br />
			<span class="font-medium">如果你对源代码感兴趣</span>：全部代码会在 2026
			国庆假期公开，可加入犇站群聊关注后续发布。
		</p>
	</div>

	<p class="mt-8 text-sm">
		以上信息可能随时更改，这里的更新可能不及时。请<a
			class="link link-hover"
			href="https://qm.qq.com/q/fDtSK1z77W"
			target="_blank"
		>
			加群 313404608{' '}
		</a>获取最新动态。
	</p>

	<div class="divider my-8"></div>

	<article class="prose max-w-none">
		{@html md.render(policy)}
	</article>
</div>
