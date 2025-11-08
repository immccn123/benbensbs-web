<script lang="ts">
	import Notification from './Notification.svelte';
	import { notifications, tasks } from '$lib/state/notifications';

	import { fade, fly } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import TaskNotification from './TaskNotification.svelte';

	let isCollapsed = true;
</script>

<div class="fixed bottom-1 right-1 z-10 min-w-56">
	<div class="grid gap-1">
		{#each Object.entries($notifications).sort((a, b) => +b[0] - +a[0]) as [key, { role, msg, lasting }] (key)}
			<div
				animate:flip={{ duration: 300 }}
				in:fly={{ x: 100, duration: 300 }}
				out:fade={{ duration: 300 }}
				class="z-10"
			>
				{#key key}
					<Notification {role}>{msg}</Notification>
				{/key}
			</div>
		{/each}
	</div>
</div>

{#if Object.keys($tasks).length}
	<div class="fixed right-4 top-4 z-20 w-80 max-w-full">
		<div class="collapse-arrow bg-base-100 border-base-300 collapse border">
			<input type="checkbox" bind:checked={isCollapsed} />
			<div class="collapse-title cursor-pointer items-center">
				任务列表（进行中 {Object.values($tasks).filter((x) => x.lasting).length}）
			</div>

			<div class="collapse-content border-base-300">
				<div class="list">
					{#each Object.entries($tasks).sort((a, b) => +a[0] - +b[0]) as [key, { role, msg, lasting }] (key)}
						<div>
							<TaskNotification {role}
								>{#key key}{@html msg}{/key}</TaskNotification
							>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
{/if}
