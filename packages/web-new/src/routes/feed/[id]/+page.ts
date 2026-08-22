import { getApiBase } from '$lib/config/base';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params: { id: benbenId }, fetch }) => {
	const benben = await fetch(`${getApiBase()}/tools/getFeed/${benbenId}`).then(
		async (res) => (await res.json()) as API.Benben | API.BenbenTakedown
	);

	return { benben, benbenId };
};
