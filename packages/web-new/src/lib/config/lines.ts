import data from './lines.json';

export type LineKind = 'api' | 'spider' | 'frontend';

export interface Line {
	name: string;
	url: string;
}

const normalizeUrl = (url: string) => url.replace(/\/+$/, '');

const normalizeLines = (lines: Line[]): Line[] =>
	lines.map((line) => ({ ...line, url: normalizeUrl(line.url) }));

export const API_LINES: Line[] = normalizeLines(data.api);
export const SPIDER_LINES: Line[] = normalizeLines(data.spider);
export const FRONTEND_LINES: Line[] = normalizeLines(data.frontend);

export const getLines = (kind: LineKind): Line[] => {
	if (kind === 'api') return API_LINES;
	if (kind === 'spider') return SPIDER_LINES;
	return FRONTEND_LINES;
};

export const KIND_LABELS: Record<LineKind, string> = {
	api: '后端',
	spider: '爬虫',
	frontend: '前端'
};
