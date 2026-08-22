import { browser } from '$app/environment';
import { hasManualOverride, setAutoApiBase, setAutoSpiderBase, type SwitchableKind } from './base';
import { checkCategory, type ProbeResult } from './check';
import { addNotification } from '$lib/state/notifications';
import { reconnectWs } from '$lib/query/ws';

const SESSION_KEY = '***';

const hostname = (url: string) => {
	try {
		return new URL(url).hostname;
	} catch {
		return url;
	}
};

const shouldSwitch = (current: ProbeResult | undefined, best: ProbeResult | null) => {
	if (!best) return false;
	if (!current || !current.ok) return true;
	if (best.latency === null || current.latency === null) return false;
	const improvement = current.latency - best.latency;
	return improvement >= Math.max(30, current.latency * 0.15);
};

const autoSwitchCategory = async (kind: SwitchableKind) => {
	if (hasManualOverride(kind)) return;

	const { current, results, best } = await checkCategory(kind);
	const currentResult = results.find((result) => result.isCurrent);
	if (!best || best.line.url === current || !shouldSwitch(currentResult, best)) return;

	if (kind === 'api') {
		setAutoApiBase(best.line.url);
	} else {
		setAutoSpiderBase(best.line.url);
		reconnectWs();
	}

	addNotification(
		'success',
		`已自动将${kind === 'api' ? ' API ' : '爬虫'}线路切换至更快的 ${hostname(best.line.url)}`
	);
};

export const autoSwitchBackends = async () => {
	if (!browser) return;

	try {
		if (sessionStorage.getItem(SESSION_KEY) === '1') return;
	} catch {
		/* 忽略 */
	}

	try {
		await Promise.all([autoSwitchCategory('api'), autoSwitchCategory('spider')]);
	} catch {
		/* 检测失败时保持安静 */
	}

	try {
		sessionStorage.setItem(SESSION_KEY, '1');
	} catch {
		/* 忽略 */
	}
};

if (browser) {
	setTimeout(() => void autoSwitchBackends(), 1500);
}
