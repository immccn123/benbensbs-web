<script lang="ts">
	import { useRegisterSW } from 'virtual:pwa-register/svelte';

	const { needRefresh, updateServiceWorker, offlineReady } = useRegisterSW({
		onRegistered(r) {
			console.log(`SW Registered: ${r}`);
		},
		onRegisterError(error) {
			console.log('SW registration error', error);
		}
	});
</script>

{#if $needRefresh}
	<div class="card bg-base-100 border-base-200 fixed bottom-2 right-2 w-80 border" role="alert">
		<div class="card-body">
			<span>新版本可用，点击更新按钮更新。</span>
			<button class="btn" on:click={() => updateServiceWorker(true)}> 更新 </button>
		</div>
	</div>
{/if}
