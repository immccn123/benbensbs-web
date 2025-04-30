<script lang="ts">
	import { settings } from '$lib/store/settings';

	export let data;

	let userInput = '';
	let followedUsersError = '';
	let showHelp = false;

	$: if ($settings && $settings.followedUsers) {
		userInput = $settings.followedUsers.join(', ');
	}

	function validateUsers(input: string) {
		if (!input.trim()) return [];

		const ids = input
			.replace(/，/g, ' ')
			.replace(/,/g, ' ')
			.split(' ')
			.map((id) => id.trim())
			.filter(Boolean);

		const inValidIds = ids.filter((id) => !/^\d+$/.test(id));
		const isValid = inValidIds.length === 0;
		if (!isValid) {
			followedUsersError = `包含无效的用户 ID [${inValidIds.join(', ')}]，请确保只输入数字`;
			return null;
		}

		followedUsersError = '';
		return ids.map(Number);
	}

	function handleInput(e: Event) {
		const target = e.target as HTMLTextAreaElement;
		const result = validateUsers(target.value);

		if (result !== null && $settings) {
			$settings.followedUsers = result;
		}
	}
</script>

<div class="container mx-auto max-w-[800px]">
	<h2 class="mb-2 text-2xl">设置</h2>
	<fieldset class="fieldset bg-base-100 border-base-300 rounded-box border p-4">
		<legend class="fieldset-legend">Markdown 渲染设置</legend>
		{#if !$settings}
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

	<fieldset class="fieldset bg-base-100 border-base-300 rounded-box border p-4">
		<legend class="fieldset-legend">关注的用户</legend>

		<textarea
			id="followedUsers"
			class="textarea textarea-ghost h-32 w-full"
			placeholder="例如：123, 456, 789"
			value={userInput}
			on:input={handleInput}
		></textarea>

		<div class="text-error mt-1 text-sm">{followedUsersError}</div>
	</fieldset>
	<div class="collapse-arrow border-base-300 collapse mt-4 border">
		<input type="checkbox" class="peer" bind:checked={showHelp} />
		<div class="collapse-title text">自动获取关注列表</div>
		<div class="collapse-content">
			在个人中心页面通过 F12 打开开发人员工具，打开控制台执行下列代码：
			<div class="bg-neutral text-neutral-content mt-2 rounded p-4">
				<pre class="wrap-anywhere whitespace-pre-wrap">{data.helpCode}</pre>
			</div>
		</div>
	</div>
</div>
