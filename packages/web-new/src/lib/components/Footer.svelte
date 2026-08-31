<script lang="ts">
	import { createDiagnosticQuery } from '$lib/query';

	// const runningDays = (
	// 	(new Date().getTime() - new Date('2023/07/01 13:05').getTime()) /
	// 	(1000 * 60 * 60 * 24)
	// ).toFixed();

	const diagnostic = createDiagnosticQuery();
</script>

<footer class="footer md:footer-horizontal bg-base-200 text-base-content p-10">
	<aside>
		<p>犇站 Version Defoliate | 将会运行到 &lt;1172 天</p>
		<p>
			Copyright &copy; 2023 - {new Date().getFullYear()}
			<a href="https://imken.moe" class="link" target="_blank"> Imken </a>
		</p>

		<p>
			问题反馈/广告位/闲聊 QQ 群 <a
				href="https://qm.qq.com/q/fDtSK1z77W"
				class="link-primary link link-hover"
				target="_blank"
			>
				313404608
			</a>
		</p>
		<p>
			<del>支持我们继续做下去！</del> 现在不用了
		</p>
		<p>
			<code>F: {__VERSION__} ({__LASTMOD__})</code>
			{#if $diagnostic.isSuccess}
				<code> B: {$diagnostic.data.version}</code>
			{/if}
			<a
				class="link link-hover"
				target="_blank"
				href="https://github.com/immccn123/lgfeed-frontend-react"
			>
				前端源码仓库
			</a>
		</p>
	</aside>
	<nav>
		<h6 class="footer-title">法律信息</h6>
		<a class="link link-hover" href="/legal/privacy">隐私政策</a>
		<a class="link link-hover" href="/legal/disclaimer">免责声明</a>
		<a class="link link-hover" href="/legal/censorship">数据移除请求</a>
		<a class="link link-hover" href="/bot">爬网程序说明</a>
	</nav>
</footer>
