<script lang="ts">
	import { useRegisterSW } from 'virtual:pwa-register/svelte'
	const {
		needRefresh,
		updateServiceWorker,
		offlineReady
	} = useRegisterSW({
		onRegistered(r) {
			console.log(`SW Registered: ${r}`)
		},
		onRegisterError(error) {
			console.log('SW registration error', error)
		},
	})
	const close = () => {
		offlineReady.set(false)
		needRefresh.set(false)
	}
	$: toast = $offlineReady || $needRefresh
</script>

{#if toast}
	<div class="pwa-toast" role="alert">
		<div class="message">
			{#if $offlineReady}
				<span>
					应用已经缓存至本地。
				</span>
			{:else}
				<span>
					新版本可用，点击更新按钮更新（可忽略）。
				</span>
			{/if}
		</div>
		{#if $needRefresh}
			<button on:click={() => updateServiceWorker(true)}>
				更新
			</button>
		{/if}
		<button on:click={close}>
			关闭
		</button>
	</div>
{/if}

<style>
	.pwa-toast {
		position: fixed;
		right: 0;
		bottom: 0;
		margin: 16px;
		padding: 12px;
		border: 1px solid #8885;
		border-radius: 4px;
		z-index: 2;
		text-align: left;
		box-shadow: 3px 4px 5px 0 #8885;
		background-color: white;
	}
	.pwa-toast .message {
		margin-bottom: 8px;
	}
	.pwa-toast button {
		border: 1px solid #8885;
		outline: none;
		margin-right: 5px;
		border-radius: 2px;
		padding: 3px 10px;
	}
</style>