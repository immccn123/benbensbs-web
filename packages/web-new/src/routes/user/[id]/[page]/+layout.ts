import type { PageLoad } from './$types';

export const load: PageLoad = ({
	params: { id, page },
	url
}: {
	params: { id: string; page: string };
	url: URL;
}) => {
	return { id, page, analytics: url.pathname.endsWith('/analytics') };
};

export const ssr = false;
