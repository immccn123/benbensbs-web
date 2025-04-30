import { writable } from 'svelte/store';
import typia from 'typia';

type Settings = {
	followedUsers: number[];
	markdownOptions: {
		katex: boolean;
		image: boolean;
		bilibili: boolean;
	};
};

const getInitialSettings = () => {
	if (typeof localStorage !== 'undefined') {
		const local = JSON.parse(localStorage.getItem('settings') ?? '{}');
		if (typia.is<Settings>(local)) {
			return local;
		}
	} else {
		return null;
	}

	return {
		followedUsers: [],
		markdownOptions: {
			katex: true,
			image: true,
			bilibili: false
		}
	};
};

export const revalidateSettings = () => settings.set(getInitialSettings());
export let settings = writable(getInitialSettings());
