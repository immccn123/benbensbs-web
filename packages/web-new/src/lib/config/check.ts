import { browser } from '$app/environment';
import { getApiBase, getSpiderBase } from './base';
import { getLines, type Line, type LineKind } from './lines';

export interface ProbeResult {
	line: Line;
	ok: boolean;
	latency: number | null;
	error?: string;
	isCurrent?: boolean;
	pending?: boolean;
}

export interface CategoryCheckResult {
	kind: LineKind;
	current: string;
	results: ProbeResult[];
	best: ProbeResult | null;
}

const PROBE_TIMEOUT: Record<LineKind, number> = {
	api: 30_000,
	spider: 30_000,
	frontend: 30_000
};

const probeUrl = (line: Line, kind: LineKind) =>
	kind === 'api' ? `${line.url}/diagnostic` : line.url;

export const probeLine = async (line: Line, kind: LineKind): Promise<ProbeResult> => {
	if (!browser) return { line, ok: false, latency: null, error: 'SSR' };

	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT[kind]);
	const start = performance.now();

	try {
		const response = await fetch(probeUrl(line, kind), {
			method: kind === 'api' ? 'GET' : 'HEAD',
			mode: kind === 'api' ? 'cors' : 'no-cors',
			cache: 'no-store',
			signal: controller.signal
		});
		const latency = Math.round(performance.now() - start);
		const ok = kind === 'api' ? response.ok : true;
		return { line, ok, latency };
	} catch (error) {
		return {
			line,
			ok: false,
			latency: null,
			error: error instanceof Error ? error.name : String(error)
		};
	} finally {
		clearTimeout(timer);
	}
};

export const checkLines = async (lines: Line[], kind: LineKind): Promise<ProbeResult[]> => {
	const results = await Promise.all(lines.map((line) => probeLine(line, kind)));
	return results.sort((a, b) => {
		if (a.ok !== b.ok) return a.ok ? -1 : 1;
		return (a.latency ?? Number.MAX_SAFE_INTEGER) - (b.latency ?? Number.MAX_SAFE_INTEGER);
	});
};

const currentBase = (kind: LineKind): string => {
	if (kind === 'api') return getApiBase();
	if (kind === 'spider') return getSpiderBase();
	return browser ? location.origin.replace(/\/+$/, '') : '';
};

const buildLines = (kind: LineKind): { current: string; lines: Line[] } => {
	const current = currentBase(kind);
	const lines: Line[] = [...getLines(kind)];

	if (current && !lines.some((line) => line.url === current)) {
		lines.unshift({ name: '当前线路', url: current });
	}

	const index = lines.findIndex((line) => line.url === current);
	if (index > 0) {
		const [currentLine] = lines.splice(index, 1);
		lines.unshift(currentLine);
	}

	return { current, lines };
};

export const computeBest = (results: ProbeResult[]): ProbeResult | null => {
	let best: ProbeResult | null = null;
	for (const result of results) {
		if (!result.ok || result.latency === null) continue;
		if (!best || result.latency < (best.latency ?? Number.MAX_SAFE_INTEGER)) best = result;
	}
	return best;
};

const sortWeight = (result: ProbeResult) => {
	if (result.isCurrent) return 0;
	if (result.ok) return 1;
	if (result.pending) return 2;
	return 3;
};

export const sortResults = (results: ProbeResult[]): ProbeResult[] =>
	[...results].sort((a, b) => {
		const weightDiff = sortWeight(a) - sortWeight(b);
		if (weightDiff !== 0) return weightDiff;
		if (a.ok && b.ok) {
			return (a.latency ?? Number.MAX_SAFE_INTEGER) - (b.latency ?? Number.MAX_SAFE_INTEGER);
		}
		return 0;
	});

export const checkCategory = async (kind: LineKind): Promise<CategoryCheckResult> => {
	const { current, lines } = buildLines(kind);
	const results = await checkLines(lines, kind);
	for (const result of results) result.isCurrent = result.line.url === current;

	const best = results.find((result) => result.ok) ?? null;
	return { kind, current, results, best };
};

export const checkAllSequential = async (
	onUpdate: (states: CategoryCheckResult[]) => void,
	isCancelled: () => boolean = () => false
): Promise<CategoryCheckResult[]> => {
	const states: CategoryCheckResult[] = (['api', 'spider', 'frontend'] as LineKind[]).map(
		(kind) => {
			const { current, lines } = buildLines(kind);
			return {
				kind,
				current,
				results: lines.map((line) => ({
					line,
					ok: false,
					latency: null,
					pending: true,
					isCurrent: line.url === current
				})),
				best: null
			};
		}
	);

	onUpdate(states);

	for (const state of states) {
		const lines = state.results.map((result) => result.line);
		for (const line of lines) {
			if (isCancelled()) return states;

			const result = await probeLine(line, state.kind);
			result.isCurrent = line.url === state.current;
			state.results = sortResults(state.results.map((r) => (r.line.url === line.url ? result : r)));
			state.best = computeBest(state.results);
			onUpdate(states);
		}
	}

	return states;
};
