<script lang="ts">
	import { onMount } from 'svelte';
	import IconGavel from '~icons/mdi/gavel';
	import IconAlert from '~icons/mdi/alert-circle-outline';
	import IconDatabase from '~icons/mdi/database-outline';
	import IconLink from '~icons/mdi/link-variant';
	import IconShieldAlert from '~icons/mdi/shield-alert-outline';
	import IconAccountAlert from '~icons/mdi/account-alert-outline';
	import IconFileDocument from '~icons/mdi/file-document-outline';
	import disclaimerContent from '../../routes/legal/disclaimer/policy.md?raw';
	import MarkdownIt from 'markdown-it';

	const md = new MarkdownIt();

	let showModal = false;
	let holdProgress = 0;
	let isHolding = false;
	let holdInterval: any;

	onMount(() => {
		const hasAgreed = localStorage.getItem('disclaimerAgreed');
		if (!hasAgreed) {
			showModal = true;
		}
	});

	function startHold() {
		isHolding = true;
		holdProgress = 0;

		holdInterval = setInterval(() => {
			holdProgress += 2;
			if (holdProgress >= 100) {
				clearInterval(holdInterval);
				localStorage.setItem('disclaimerAgreed', 'true');
				showModal = false;
			}
		}, 60);
	}

	function stopHold() {
		isHolding = false;
		clearInterval(holdInterval);
		holdProgress = 0;
	}
</script>

{#if showModal}
	<div class="modal modal-open">
		<div class="modal-box max-h-[90vh] max-w-4xl">
			<div class="mb-6 text-center">
				<div class="mb-2 flex items-center justify-center gap-3">
					<IconGavel class="text-primary h-8 w-8" />
					<h3 class="text-3xl font-bold">欢迎使用犇站</h3>
				</div>
				<p class="text-base-content/60 text-sm">请仔细阅读免责声明</p>
			</div>

			<div class="divider"></div>

			<div class="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3">
				<div class="card bg-base-200 shadow-sm">
					<div class="card-body items-center p-4 text-center">
						<IconDatabase class="text-info mb-2 h-8 w-8" />
						<h5 class="text-sm font-semibold">数据来源说明</h5>
						<p class="text-base-content/70 text-xs">第三方公开数据</p>
					</div>
				</div>

				<div class="card bg-base-200 shadow-sm">
					<div class="card-body items-center p-4 text-center">
						<IconAlert class="text-warning mb-2 h-8 w-8" />
						<h5 class="text-sm font-semibold">准确性声明</h5>
						<p class="text-base-content/70 text-xs">不保证完全准确</p>
					</div>
				</div>

				<div class="card bg-base-200 shadow-sm">
					<div class="card-body items-center p-4 text-center">
						<IconLink class="text-secondary mb-2 h-8 w-8" />
						<h5 class="text-sm font-semibold">外部链接风险</h5>
						<p class="text-base-content/70 text-xs">第三方网站自负责任</p>
					</div>
				</div>

				<div class="card bg-base-200 shadow-sm">
					<div class="card-body items-center p-4 text-center">
						<IconAccountAlert class="text-error mb-2 h-8 w-8" />
						<h5 class="text-sm font-semibold">用户使用责任</h5>
						<p class="text-base-content/70 text-xs">独立判断，自担风险</p>
					</div>
				</div>

				<div class="card bg-base-200 shadow-sm">
					<div class="card-body items-center p-4 text-center">
						<IconShieldAlert class="text-accent mb-2 h-8 w-8" />
						<h5 class="text-sm font-semibold">损失免责范围</h5>
						<p class="text-base-content/70 text-xs">不承担任何直接间接损失</p>
					</div>
				</div>

				<div class="card bg-base-200 shadow-sm">
					<div class="card-body items-center p-4 text-center">
						<IconFileDocument class="text-success mb-2 h-8 w-8" />
						<h5 class="text-sm font-semibold">条款修订权利</h5>
						<p class="text-base-content/70 text-xs">保留随时修改更新权利</p>
					</div>
				</div>
			</div>

			<div class="bg-base-200 rounded-lg p-6">
				<div class="mb-4 flex items-center gap-2">
					<IconAlert class="text-warning h-6 w-6" />
					<h4 class="text-xl font-bold">免责声明详情</h4>
				</div>

				<div
					class="custom-scrollbar prose prose-sm max-h-64 max-w-none overflow-y-auto pr-2"
				>
					{@html md.render(disclaimerContent)}
				</div>
			</div>

			<div class="divider"></div>

			<div class="flex flex-col items-center gap-3">
				<button
					class="btn btn-primary btn-lg relative w-64 overflow-hidden"
					on:mousedown={startHold}
					on:mouseup={stopHold}
					on:mouseleave={stopHold}
					on:touchstart={startHold}
					on:touchend={stopHold}
				>
					<div
						class="bg-black/20 absolute left-0 top-0 h-full transition-all duration-75 z-20"
						style="width: {holdProgress}%"
					></div>
					<span class="relative z-10">
						{#if isHolding}
							长按以同意并继续 ({Math.ceil((99 - holdProgress) / 33)}秒)
						{:else}
							长按以同意并继续
						{/if}
					</span>
				</button>

				<button class="btn btn-ghost btn-sm" disabled>
					不同意请关闭页面
				</button>
			</div>
		</div>
	</div>
{/if}
