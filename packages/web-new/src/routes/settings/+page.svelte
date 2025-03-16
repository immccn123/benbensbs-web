<script lang="ts">
	import { settings } from '../../store/settings';
</script>

<div class="container mx-auto">
	<h2 class="mb-2 text-2xl">设置</h2>
	<fieldset class="fieldset bg-base-100 border-base-300 rounded-box border p-4">
		<legend class="fieldset-legend">Markdown 渲染设置</legend>
		{#if 'initializing' in $settings}
			正在初始化
		{:else}
			<!-- <label class="fieldset-label">
				<input
					type="checkbox"
					class="checkbox"
					bind:checked={$settings.markdownOptions.katex}
				/>
				启用 KaTeX
			</label> -->

			<label class="fieldset-label">
				<input
					type="checkbox"
					class="checkbox"
					bind:checked={$settings.markdownOptions.bilibili}
				/>
				解析 bilibili 视频
			</label>

			<!-- <label class="fieldset-label">
				<input
					type="checkbox"
					class="checkbox"
					bind:checked={$settings.markdownOptions.image}
				/>
				显示图片
			</label> -->
		{/if}
	</fieldset>
</div>
