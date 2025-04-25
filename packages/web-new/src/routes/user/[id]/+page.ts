import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params: { id } }) => {
	redirect(301, `/user/${id}/1`);
};
