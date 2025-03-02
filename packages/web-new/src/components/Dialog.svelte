<script lang="ts">
	import type { Optional } from '$lib/types';
	import type { Snippet } from 'svelte';

	export function showModal() {
		dialog.showModal();
	}

	let dialog: HTMLDialogElement;

	let {
		children = undefined as Optional<Snippet>,
		title = undefined as Optional<Snippet | string>,
		action = undefined as Optional<Snippet>
	} = $props();
</script>

<dialog class="modal" bind:this={dialog}>
	<div class="modal-box">
		{#if typeof title !== 'string'}
			{@render title?.()}
		{:else}
			<h3 class="text-lg font-bold">
				{title}
			</h3>
		{/if}
		<div class="py-4">
			{@render children?.()}
		</div>
		<div class="modal-action">
			{@render action?.()}
		</div>
	</div>
</dialog>
