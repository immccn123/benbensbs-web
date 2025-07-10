import { writable } from 'svelte/store';

interface Notification {
	role: string;
	msg: string;
	lasting: boolean;
}

export const notifications = writable({} as Record<number, Notification>);
export default notifications;
export const id = writable(0);

export const addNotification = (
	role: string,
	msg: string,
	timeout: number = 3000,
	lasting = false
): number => {
	let newId: number = 0;
	id.update((n) => (newId = n + 1));
	notifications.update((notification) => {
		notification[newId] = { role, msg, lasting };
		return notification;
	});

	if (!lasting)
		setTimeout(() => {
			notifications.update((notification) => {
				delete notification[newId];
				return notification;
			});
		}, timeout);

	return newId;
};

export const removeNotification = (id: number) =>
	notifications.update((notification) => {
		delete notification[id];
		return notification;
	});

export const updateNotification = (id: number, role: string, msg: string, lasting: boolean) => {
	notifications.update((notification) => {
		if (notification[id]) {
			notification[id] = { role, msg, lasting };
		}
		return notification;
	});
};
