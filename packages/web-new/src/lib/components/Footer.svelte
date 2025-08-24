<script lang="ts">
	import Ad from './Ad.svelte';

	const runningDays = (
		(new Date().getTime() - new Date('2023/07/01 13:05').getTime()) /
		(1000 * 60 * 60 * 24)
	).toFixed();
</script>

<Ad />

<footer class="footer md:footer-horizontal bg-base-200 text-base-content p-10">
	<aside>
		<p>犇站 Zephyr Version</p>
		<p>
			Copyright &copy; 2023 - {new Date().getFullYear()}
			<a href="https://imken.moe" class="link" target="_blank"> Imken </a>
		</p>
		<p>
			网站已运行 {runningDays} 天然而没有跑路真是一个奇迹
		</p>
		<p>
			反馈/广告位/闲聊可添加 QQ 群 <a
				href="https://qm.qq.com/q/fDtSK1z77W"
				class="link"
				target="_blank"
			>
				313404608
			</a>
		</p>
		<p>
			支持我们继续做下去！
			<a class="link link-error link-hover" href="https://sponsor.imken.moe/"
				>捐赠（请备注为犇站）</a
			>
		</p>
		<p>
			<code>F: {__VERSION__} ({__LASTMOD__})</code>
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
	</nav>
</footer>
