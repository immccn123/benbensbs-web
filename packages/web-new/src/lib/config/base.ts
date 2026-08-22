import { get, writable } from 'svelte/store';
import { browser } from '$app/environment';
import { PUBLIC_API_BASE, PUBLIC_SPIDER_BASE } from '$env/static/public';

export const DEFAULT_API_BASE = PUBLIC_API_BASE.replace(/\/+$/, '');
export const DEFAULT_SPIDER_BASE = PUBLIC_SPIDER_BASE.replace(/\/+$/, '');

export type SwitchableKind = 'api' | 'spider';

const MANUAL_KEY = '***';
const AUTO_KEY = '***';

interface Overrides {
	api?: string;
	spider?: string;
}

const loadJson = (key: string): Overrides => {
	if (!browser) return {};
	try {
		return JSON.parse(localStorage.getItem(key) ?? '{}') as Overrides;
	} catch {
		return {};
	}
};

const saveJson = (key: string, value: Overrides) => {
	if (!browser) return;
	try {
		localStorage.setItem(key, JSON.stringify(value));
	} catch {
		/* 存储不可用时静默忽略 */
	}
};

const manual = loadJson(MANUAL_KEY);
const auto = loadJson(AUTO_KEY);

export const apiBase = writable(manual.api ?? auto.api ?? DEFAULT_API_BASE);
export const spiderBase = writable(manual.spider ?? auto.spider ?? DEFAULT_SPIDER_BASE);

export const getApiBase = () => get(apiBase);
export const getSpiderBase = () => get(spiderBase);

export const hasManualOverride = (kind: SwitchableKind) => Boolean(loadJson(MANUAL_KEY)[kind]);

export const setApiBase = (url: string) => {
	apiBase.set(url);
	saveJson(MANUAL_KEY, { ...loadJson(MANUAL_KEY), api: url });
};

export const setSpiderBase = (url: string) => {
	spiderBase.set(url);
	saveJson(MANUAL_KEY, { ...loadJson(MANUAL_KEY), spider: url });
};

export const setAutoApiBase = (url: string) => {
	apiBase.set(url);
	saveJson(AUTO_KEY, { ...loadJson(AUTO_KEY), api: url });
};

export const setAutoSpiderBase = (url: string) => {
	spiderBase.set(url);
	saveJson(AUTO_KEY, { ...loadJson(AUTO_KEY), spider: url });
};

export const resetLineOverrides = () => {
	apiBase.set(DEFAULT_API_BASE);
	spiderBase.set(DEFAULT_SPIDER_BASE);
	if (browser) {
		try {
			localStorage.removeItem(MANUAL_KEY);
			localStorage.removeItem(AUTO_KEY);
		} catch {
			/* 忽略 */
		}
	}
};

export const getSpiderWsUrl = () => `${getSpiderBase().replace(/^http/i, 'ws')}/ws`;
