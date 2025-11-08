<script lang="ts">
	import MdiErrorOutline from '~icons/mdi/error-outline';
	import MdiWarningOutline from '~icons/mdi/warning-outline';
	import MdiSuccessCircleOutline from '~icons/mdi/success-circle-outline';
	import MdiInformationOutline from '~icons/mdi/information-outline';

	export let role: string;
</script>

<div class="list-row border-l-4 border-l-{role} rounded-none">
	{#if role === 'error'}
		<MdiErrorOutline />
	{:else if role === 'warning'}
		<MdiWarningOutline />
	{:else if role === 'success'}
		<MdiSuccessCircleOutline />
	{:else}
		<MdiInformationOutline />
	{/if}

	<span class="text-sm">
		<slot></slot>
	</span>

	{#if role == 'loading'}
		<div class="absolute bottom-0 left-0 h-[2px] w-full overflow-hidden" aria-hidden="true">
			<div class="vscode-progress-band absolute h-full"></div>
		</div>
	{/if}
</div>

<style>
	@keyframes vscode-progress-move {
		0% {
			transform: translateX(-100%);
		}
		100% {
			transform: translateX(100%);
		}
	}

	@keyframes vscode-shine {
		0% {
			left: -100%;
			opacity: 0;
		}
		50% {
			opacity: 0.7;
		}
		100% {
			left: 100%;
			opacity: 0;
		}
	}

	.vscode-progress-band {
		animation: vscode-progress-move 3s linear infinite;
		position: relative;
	}

	.vscode-progress-band::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 30%;
		height: 100%;
		background: rgba(255, 255, 255, 0.5);
		filter: blur(2px);
		animation: vscode-shine 3s linear infinite;
	}

	@media (prefers-color-scheme: light) {
		.vscode-progress-band::before {
			background: rgba(0, 0, 0, 0.5);
		}
	}
</style>
