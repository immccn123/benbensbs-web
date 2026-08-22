<script lang="ts">
	import { onMount } from 'svelte';
	import MdiLeaf from '~icons/mdi/leaf';
	import { leafDrop } from '$lib/state/leaf';

	interface Leaf {
		id: number;
		left: number;
		size: number;
		duration: number;
		sway: number;
		drift: number;
		spin: number;
	}

	let leaves: Leaf[] = [];
	let nextId = 0;

	let reduced = false;

	const spawn = () => {
		const leaf: Leaf = {
			id: nextId++,
			left: 5 + Math.random() * 90,
			size: 12 + Math.random() * 9,
			duration: 16 + Math.random() * 10,
			sway: 3 + Math.random() * 2,
			drift: 40 + Math.random() * 100,
			spin: 200 + Math.random() * 200
		};
		leaves = [...leaves, leaf];
		setTimeout(
			() => {
				leaves = leaves.filter((l) => l.id !== leaf.id);
			},
			leaf.duration * 1000 + 500
		);
	};

	onMount(() => {
		reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		console.log('秋天不是叶子先放弃的。');

		return leafDrop.subscribe((count) => {
			if (count > 0 && !reduced) spawn();
		});
	});
</script>

{#if !reduced}
	<div aria-hidden="true" class="pointer-events-none fixed inset-0 z-[5] overflow-hidden">
		{#each leaves as leaf (leaf.id)}
			<div
				class="defoliate-fall absolute -top-6"
				style:left="{leaf.left}vw"
				style:--drift="{leaf.drift}px"
				style:--spin="{leaf.spin}deg"
				style:animation-duration="{leaf.duration}s"
			>
				<div class="defoliate-sway" style:animation-duration="{leaf.sway}s">
					<MdiLeaf
						width={leaf.size}
						height={leaf.size}
						class="text-amber-700/40 dark:text-amber-400/30"
					/>
				</div>
			</div>
		{/each}
	</div>
{/if}

<style>
	.defoliate-fall {
		animation-name: defoliate-fall;
		animation-timing-function: linear;
		animation-fill-mode: forwards;
	}

	.defoliate-sway {
		animation-name: defoliate-sway;
		animation-timing-function: ease-in-out;
		animation-iteration-count: infinite;
	}

	@keyframes defoliate-fall {
		0% {
			transform: translateY(0) rotate(0deg);
			opacity: 0;
		}
		8% {
			opacity: 1;
		}
		85% {
			opacity: 1;
		}
		100% {
			transform: translateY(108vh) rotate(var(--spin));
			opacity: 0;
		}
	}

	@keyframes defoliate-sway {
		0%,
		100% {
			transform: translateX(calc(var(--drift) * -0.5)) rotate(-10deg);
		}
		50% {
			transform: translateX(calc(var(--drift) * 0.5)) rotate(10deg);
		}
	}
</style>
