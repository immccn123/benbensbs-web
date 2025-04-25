import type { PageLoad } from "./$types";

export const load: PageLoad = ({ params: { id, page } }) => {
	return { id, page };
};

export const ssr = false;
