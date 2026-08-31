<script lang="ts">
	import MarkdownIt from 'markdown-it';
	import policy from './policy.md?raw';
	import { setTitle } from '$lib/state/title';

	setTitle('跑路了');
</script>

<article class="prose mx-auto">
	{@html new MarkdownIt().render(policy)}
</article>
