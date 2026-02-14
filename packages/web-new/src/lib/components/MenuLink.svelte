<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';

	afterNavigate(() => {
		pathname = page.url.pathname;
	});

	let pathname = page.url.pathname;

	export let to: string | undefined = undefined;
	export let title = false;
	export let fullMatch = false;
</script>

<li class={[to === undefined && "menu-disabled", title && "menu-title", "w-fit","hover:w-56", "relative"]}>
	{#if to !== undefined}
		<a
			class="overflow-hidden text-nowrap"
			href={to}
			class:menu-active={fullMatch ? pathname === to : pathname.startsWith(to)}
			target={to.startsWith('/') ? undefined : '_blank'}
		>
			{#if $$slots.icon}
				<slot name="icon"></slot>
			{:else}
				<svg height="28px" width="28px"></svg>
			{/if}
			<span class="inline-block text-nowrap py-0 transition-opacity" data-content>
				<slot />
			</span>
		</a>
	{:else}
		<span class="overflow-hidden text-nowrap">
			{#if $$slots.icon}
				<slot name="icon"></slot>
			{:else}
				<svg height="28px" width="28px"></svg>
			{/if}
			<span class="text-nowrap py-0 transition-opacity" data-content>
				<slot />
			</span>
		</span>
	{/if}
</li>
