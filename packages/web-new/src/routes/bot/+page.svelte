<script lang="ts">
	import MarkdownIt from 'markdown-it';
	import policy from './policy.md?raw';
	import { setTitle } from '$lib/state/title';

	setTitle('犇站爬虫概述');
</script>

<article class="prose mx-auto">
	{@html new MarkdownIt({ html: true }).render(policy)}
</article>
