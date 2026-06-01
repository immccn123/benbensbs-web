<script lang="ts">
	export let title: string;
	export let subtitle: string;
</script>

<header class="mb-8 flex items-start gap-3">
	<div class="bg-primary/40 h-16 w-1 shrink-0 rounded-full"></div>
	<div>
		<h1 class="text-4xl font-light tracking-tight">{title}</h1>
		<p class="mt-1 text-xs opacity-50">{subtitle}</p>
	</div>
</header>
