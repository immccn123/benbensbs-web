import type { PageLoad } from './$types';

export const load: PageLoad = ({ params: { id, page }, url }) => {
	return { id, page, analytics: url.pathname.endsWith('/analytics') };
};

export const ssr = false;
