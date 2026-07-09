<script lang="ts">
	import { PUBLIC_API_BASE } from '$env/static/public';
	import { setTitle } from '$lib/state/title';
	import { tick } from 'svelte';
	import Loader from '$lib/components/Loader.svelte';
	import MdiCompare from '~icons/mdi/compare';
	import MdiAlertCircle from '~icons/mdi/alert-circle';
	import MdiArrowLeft from '~icons/mdi/arrow-left';
	import MdiArrowRight from '~icons/mdi/arrow-right';

	setTitle('相似度匹配');

	let uidA = $state('');
	let uidB = $state('');
	let isLoading = $state(false);
	let result: API.Duel | undefined = $state();
	let errorText = $state('');
	let animated = $state(false);

	$effect(() => {
		if (result) {
			animated = false;
			tick().then(() => {
				requestAnimationFrame(() => {
					animated = true;
				});
			});
		}
	});

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
		if (v > 0.8) return { label: '高度契合', cls: 'badge-success', bg: 'bg-success/20' };
		if (v > 0.5) return { label: '中度共鸣', cls: 'badge-warning', bg: 'bg-warning/20' };
		return { label: '差异较大', cls: 'badge-error', bg: 'bg-error/20' };
	}

	function divergenceInfo(v: number) {
		const absV = Math.abs(v);
		if (absV <= 0.5) return { side: '' as 'a' | 'b' | '', label: '发散度相近' };
		const pct = ((Math.exp(absV) - 1) * 100).toFixed(1);
		if (v > 0) return { side: 'a' as const, label: `A 更发散 ${pct}%` };
		return { side: 'b' as const, label: `B 更发散 ${pct}%` };
	}

	function meanRatioInfo(v: number) {
		const diff = Math.abs(v - 1);
		if (diff < 0.02) return { side: '' as 'a' | 'b' | '', label: '多样性相近' };
		if (v > 1) return { side: 'a' as const, label: 'A 表达更丰富' };
		return { side: 'b' as const, label: 'B 表达更丰富' };
	}

	function stdDiffLabel(v: number) {
		if (v > 0.05) return '稳定性有差异';
		return '稳定性相近';
	}

	function duplicateRateInfo(v: number) {
		const pct = (v * 100).toFixed(2) + '%';
		if (v > 0.3) return { text: pct, warn: '可能存在相互复读' };
		return { text: pct, warn: '' };
	}

	function sideBorder(side: 'a' | 'b' | '') {
		if (side === 'a') return 'border-l-4 border-l-warning';
		if (side === 'b') return 'border-r-4 border-r-warning';
		return '';
	}
</script>

<div class="container mx-auto">
	<h2 class="mb-4 flex items-center gap-2 text-2xl">
		<MdiCompare /> 相似度匹配
	</h2>

	<form onsubmit={submit} class="mb-4">
		<div class="join">
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
		{@const di = divergenceInfo(result.divergence)}
		{@const mi = meanRatioInfo(result.entropy.mean_ratio)}
		{@const dup = duplicateRateInfo(result.duplicate_rate)}
		{@const topicBar = result.topic_resonance * 100}

		<div class="grid gap-3 md:grid-cols-2">
			<!-- 话题重合度 -->
			<div class="card card-border bg-base-200 relative col-span-full">
				<div
					class="rounded-box absolute bottom-0 left-0 h-full transition-[width] duration-700 ease-out {tr.bg}"
					style="width: {animated ? topicBar : 0}%"
				></div>
				<div class="card-body gap-1 p-4">
					<div class="flex items-center justify-between">
						<span class="text-sm opacity-70">话题重合度</span>
						<span class="badge badge-xs {tr.cls}">{tr.label}</span>
					</div>
					<div class="flex items-end gap-2">
						<span class="font-mono text-3xl font-bold"
							>{(result.topic_resonance * 100).toFixed(1)}%</span
						>
						<span
							class="tooltip tooltip-top ml-auto text-xs opacity-60"
							data-tip="表示二者话题的相似程度，上限 100%，该值越高则话题越相似。"
							>?</span
						>
					</div>
				</div>
			</div>

			<!-- 发散度对比 -->
			<div
				class="card card-border bg-base-200 transition-[border-color] duration-300"
				class:border-l-4={animated && di.side === 'a'}
				class:border-l-warning={animated && di.side === 'a'}
				class:border-r-4={animated && di.side === 'b'}
				class:border-r-warning={animated && di.side === 'b'}
			>
				<div class="card-body gap-1 p-4">
					<div class="flex items-center justify-between">
						<span class="text-sm opacity-70">发散度对比</span>
						<span
							class="tooltip tooltip-top text-xs opacity-60"
							data-tip="正数表示 A 话题面更广，负数表示 B 更广，绝对值越大差异越明显。"
							>?</span
						>
					</div>
					<div class="flex items-baseline gap-2">
						{#if di.side === 'a'}<MdiArrowLeft class="text-warning" />{/if}
						<span class="font-mono text-2xl font-bold"
							>{result.divergence.toFixed(4)}</span
						>
						{#if di.side === 'b'}<MdiArrowRight class="text-warning" />{/if}
						<span class="text-xs opacity-50">{di.label}</span>
					</div>
				</div>
			</div>

			<!-- 表达多样性 -->
			<div
				class="card card-border bg-base-200 transition-[border-color] duration-300"
				class:border-l-4={animated && mi.side === 'a'}
				class:border-l-info={animated && mi.side === 'a'}
				class:border-r-4={animated && mi.side === 'b'}
				class:border-r-info={animated && mi.side === 'b'}
			>
				<div class="card-body gap-1 p-4">
					<div class="flex items-center justify-between">
						<span class="text-sm opacity-70">表达多样性</span>
						<span
							class="tooltip tooltip-top text-xs opacity-60"
							data-tip="大于 1 表示 A 用词更丰富多变，小于 1 表示 B 更丰富多变。"
							>?</span
						>
					</div>
					<div class="flex items-baseline gap-2">
						{#if mi.side === 'a'}<MdiArrowLeft class="text-info" />{/if}
						<span class="font-mono text-2xl font-bold"
							>{result.entropy.mean_ratio.toFixed(4)}</span
						>
						{#if mi.side === 'b'}<MdiArrowRight class="text-info" />{/if}
						<span class="text-xs opacity-50">{mi.label}</span>
					</div>
				</div>
			</div>

			<!-- 表达稳定性 -->
			<div class="card card-border bg-base-200">
				<div class="card-body gap-1 p-4">
					<span class="text-sm opacity-70">表达稳定性</span>
					<div class="flex items-baseline gap-2">
						<span class="font-mono text-2xl font-bold"
							>{result.entropy.std_diff.toFixed(4)}</span
						>
						<span class="text-xs opacity-50"
							>{stdDiffLabel(result.entropy.std_diff)}</span
						>
						<span
							class="tooltip tooltip-top ml-auto text-xs opacity-60"
							data-tip="该值越大表示两人表达稳定性的差异越大。">?</span
						>
					</div>
				</div>
			</div>

			<!-- 复读检测 -->
			<div
				class="card card-border {dup.warn
					? 'bg-warning/10 border-warning/30'
					: 'bg-base-200'}"
			>
				<div class="card-body gap-1 p-4">
					<span class="text-sm opacity-70">复读检测</span>
					<div class="flex items-baseline gap-2">
						<span class="font-mono text-2xl font-bold {dup.warn ? 'text-warning' : ''}"
							>{dup.text}</span
						>
						<span class="text-xs {dup.warn ? 'text-warning' : 'opacity-50'}"
							>{dup.warn || '未检测到复读'}</span
						>
						<span
							class="tooltip tooltip-top ml-auto text-xs opacity-60"
							data-tip="检测双方是否存在相互复读的行为，超过 30% 需留意。">?</span
						>
					</div>
				</div>
			</div>

			<!-- 采样数量 -->
			<div class="card card-border bg-base-200">
				<div class="card-body gap-1 p-4">
					<span class="text-sm opacity-70">采样数量</span>
					<div class="flex gap-4">
						<div class="font-mono">
							<span class="opacity-50">A </span><span class="text-lg font-bold"
								>{result.sample_count_a}</span
							><span class="text-xs opacity-50"> 条</span>
						</div>
						<div class="font-mono">
							<span class="opacity-50">B </span><span class="text-lg font-bold"
								>{result.sample_count_b}</span
							><span class="text-xs opacity-50"> 条</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>
