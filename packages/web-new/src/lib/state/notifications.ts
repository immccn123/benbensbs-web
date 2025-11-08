import { writable } from 'svelte/store';

interface Notification {
	role: string;
	msg: string;
	lasting: boolean;
}

export const notifications = writable({} as Record<number, Notification>);

export const tasks = writable({} as Record<number, Notification>);

export default notifications;

export const id = writable(0);

const addItem = (
	target: typeof notifications,
	role: string,
	msg: string,
	timeout: number = 3000,
	lasting = false
): number => {
	let newId: number = 0;
	id.update((n) => (newId = n + 1));
	target.update((notification) => {
		notification[newId] = { role, msg, lasting };
		return notification;
	});

	if (!lasting)
		setTimeout(() => {
			target.update((notification) => {
				delete notification[newId];
				return notification;
			});
		}, timeout);

	return newId;
};

export const removeItem = (target: typeof notifications, id: number) =>
	target.update((notification) => {
		delete notification[id];
		return notification;
	});

export const updateItem = (
	target: typeof notifications,
	id: number,
	role: string,
	msg: string,
	lasting: boolean
) => {
	target.update((notification) => {
		if (notification[id]) {
			notification[id] = { role, msg, lasting };
		}
		return notification;
	});
};

export const addNotification = (
	role: string,
	msg: string,
	timeout: number = 3000,
	lasting = false
): number => addItem(notifications, role, msg, timeout, lasting);

export const addTask = (
	role: string,
	msg: string,
	timeout: number = 3000,
	lasting = false
): number => addItem(tasks, role, msg, timeout, lasting);

export const removeNotification = (id: number) => removeItem(notifications, id);
export const removeTask = (id: number) => removeItem(tasks, id);

export const updateNotification = (id: number, role: string, msg: string, lasting: boolean) =>
	updateItem(notifications, id, role, msg, lasting);
export const updateTask = (id: number, role: string, msg: string, lasting: boolean) =>
	updateItem(tasks, id, role, msg, lasting);
