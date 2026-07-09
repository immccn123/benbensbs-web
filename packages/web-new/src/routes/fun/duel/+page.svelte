<script lang="ts">
	import { PUBLIC_API_BASE } from '$env/static/public';
	import { setTitle } from '$lib/state/title';
	import Loader from '$lib/components/Loader.svelte';
	import MdiCompare from '~icons/mdi/compare';
	import MdiAlertCircle from '~icons/mdi/alert-circle';

	setTitle('相似度匹配');

	let uidA = $state('');
	let uidB = $state('');
	let isLoading = $state(false);
	let result: API.Duel | undefined = $state();
	let errorText = $state('');

	async function submit(e: SubmitEvent) {
		e.preventDefault();
		if (!uidA || !uidB) return;
		isLoading = true;
		errorText = '';
		result = undefined;
		try {
			const res = await fetch(`${PUBLIC_API_BASE}/fun/duel?uid_a=${uidA}&uid_b=${uidB}`);
			const text = await res.text();
			let json: any;
			try {
				json = JSON.parse(text);
			} catch {
				errorText = text;
				return;
			}
			if (json.code !== 200) {
				errorText = JSON.stringify(json, null, 2);
				return;
			}
			result = json.data;
		} catch (e) {
			errorText = String(e);
		} finally {
			isLoading = false;
		}
	}

	function topicResonance(v: number) {
		if (v > 0.8) return { label: '高度契合', cls: 'badge-success' };
		if (v > 0.5) return { label: '中度共鸣', cls: 'badge-warning' };
		return { label: '差异较大', cls: 'badge-error' };
	}

	function divergenceInfo(v: number, a: number, b: number) {
		const absV = Math.abs(v);
		if (absV <= 0.5) return { main: '发散度相近', sub: '' };
		const pct = ((Math.exp(absV) - 1) * 100).toFixed(1);
		if (v > 0) return { main: `A(${a}) 更发散`, sub: `发散 ${pct}%` };
		return { main: `B(${b}) 更发散`, sub: `发散 ${pct}%` };
	}

	function meanRatioLabel(v: number) {
		if (v > 1.2) return 'A 表达更丰富';
		if (v < 0.8) return 'B 表达更丰富';
		return '多样性相近';
	}

	function stdDiffLabel(v: number) {
		if (v > 0.05) return '稳定性有差异';
		return '稳定性相近';
	}

	function duplicateRateInfo(v: number) {
		const pct = (v * 100).toFixed(2) + '%';
		if (v > 0.3) return { text: pct, warn: '存在较多相似用词' };
		return { text: pct, warn: '' };
	}

	function cardClass(warn: boolean) {
		return warn
			? 'card card-border bg-warning/10 border-warning/30'
			: 'card card-border bg-base-200';
	}
</script>

<div class="container mx-auto">
	<h2 class="mb-3 flex items-center gap-2 text-2xl">
		<MdiCompare /> 相似度匹配
	</h2>

	<form onsubmit={submit} class="mb-4">
		<div class="join mb-2">
			<input
				type="number"
				class="input join-item input-bordered w-36"
				placeholder="UID A"
				disabled={isLoading}
				bind:value={uidA}
			/>
			<span class="btn join-item no-animation pointer-events-none opacity-50">vs</span>
			<input
				type="number"
				class="input join-item input-bordered w-36"
				placeholder="UID B"
				disabled={isLoading}
				bind:value={uidB}
			/>
			<button
				class="btn join-item btn-primary"
				disabled={isLoading || !uidA || !uidB}
				type="submit"
			>
				比较
			</button>
		</div>
	</form>

	{#if isLoading}
		<Loader />
	{:else if errorText}
		<div class="alert alert-error">
			<MdiAlertCircle />
			<pre class="text-sm break-all whitespace-pre-wrap">{errorText}</pre>
		</div>
	{:else if result}
		{@const tr = topicResonance(result.topic_resonance)}
		{@const di = divergenceInfo(result.divergence, result.uid_a, result.uid_b)}
		{@const dr = duplicateRateInfo(result.duplicate_rate)}
		<div class="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
			<div class={cardClass(false)}>
				<div class="card-body gap-1 p-4">
					<div class="text-sm opacity-70">话题重合度</div>
					<div class="font-mono text-2xl font-bold">
						{(result.topic_resonance * 100).toFixed(2)}%
					</div>
					<div class="badge {tr.cls}">{tr.label}</div>
					<div class="text-xs opacity-40">余弦相似度 · 值域 0~1</div>
				</div>
			</div>

			<div class={cardClass(di.sub !== '')}>
				<div class="card-body gap-1 p-4">
					<div class="text-sm opacity-70">发散度对比</div>
					<div class="font-mono text-2xl font-bold">
						{result.divergence.toFixed(4)}
					</div>
					<div>{di.main}</div>
					{#if di.sub}
						<div class="text-sm opacity-70">{di.sub}</div>
					{/if}
					<div class="text-xs opacity-40">v_a/v_b 的对数 · 值域 -3~3</div>
				</div>
			</div>

			<div class={cardClass(false)}>
				<div class="card-body gap-1 p-4">
					<div class="text-sm opacity-70">表达多样性</div>
					<div class="font-mono text-2xl font-bold">
						{result.entropy.mean_ratio.toFixed(4)}
					</div>
					<div>{meanRatioLabel(result.entropy.mean_ratio)}</div>
					<div class="text-xs opacity-40">组内余弦距离均值比</div>
				</div>
			</div>

			<div class={cardClass(false)}>
				<div class="card-body gap-1 p-4">
					<div class="text-sm opacity-70">表达稳定性</div>
					<div class="font-mono text-2xl font-bold">
						{result.entropy.std_diff.toFixed(4)}
					</div>
					<div>{stdDiffLabel(result.entropy.std_diff)}</div>
					<div class="text-xs opacity-40">组内余弦距离标准差差值</div>
				</div>
			</div>

			<div class={cardClass(!!dr.warn)}>
				<div class="card-body gap-1 p-4">
					<div class="text-sm opacity-70">SimHash 重复率</div>
					<div class="font-mono text-2xl font-bold">{dr.text}</div>
					{#if dr.warn}
						<div class="text-warning">{dr.warn}</div>
					{:else}
						<div class="opacity-50">正常</div>
					{/if}
					<div class="text-xs opacity-40">SimHash 近重复率 · 值域 0~1</div>
				</div>
			</div>

			<div class="card card-border bg-base-200">
				<div class="card-body gap-1 p-4">
					<div class="text-sm opacity-70">采样数量</div>
					<div class="flex flex-col gap-1">
						<div class="font-mono text-lg">
							<span class="opacity-70">A: </span>{result.sample_count_a} 条
						</div>
						<div class="font-mono text-lg">
							<span class="opacity-70">B: </span>{result.sample_count_b} 条
						</div>
					</div>
					<div class="text-xs opacity-40">各自采样条数</div>
				</div>
			</div>
		</div>
	{/if}
</div>
