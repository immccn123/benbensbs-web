<script lang="ts">
	import MdiLinkVariant from '~icons/mdi/link-variant';
	import MdiClose from '~icons/mdi/close';
	import MdiShareVariant from '~icons/mdi/share-variant';

	import Dialog from './Dialog.svelte';
	import Loader from './Loader.svelte';

	import { copyText, generateQRCode } from '$lib';
	import { addNotification } from '$lib/state/notifications';

	import { shareDialogStore } from '$lib/state/dialog';

	import { onMount } from 'svelte';

	let origin = 'https://benben.sbs';
	let shareDialog: Dialog | null = null;

	onMount(() => {
		origin = location.origin;
	});

	shareDialogStore.subscribe(() => {
		shareDialog?.showModal();
	});
</script>

<Dialog bind:this={shareDialog}>
	{#snippet title()}
		<h3 class="text-lg font-bold">
			<span><MdiShareVariant class="inline" /> 分享</span>
		</h3>
	{/snippet}

	<div class="grid gap-3">
		{#await generateQRCode(new URL(`/feed/${$shareDialogStore.id}`, origin).toString())}
			<Loader />
		{:then src}
			<img {src} alt="QR Code" />
		{/await}
	</div>

	{#snippet action()}
		<form class="join" method="dialog">
			<button
				class="btn join-item"
				on:click={() => {
					if ($shareDialogStore.id) {
						copyText(new URL(`/feed/${$shareDialogStore.id}`, origin).toString());
						addNotification('success', '复制成功！');
					}
				}}
			>
				<MdiLinkVariant /> 复制链接
			</button>
			<button class="btn btn-error join-item">
				<MdiClose /> 关闭
			</button>
		</form>
	{/snippet}
</Dialog>
