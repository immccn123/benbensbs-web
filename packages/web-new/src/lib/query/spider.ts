import { addNotification } from '$lib/state/notifications';
import { PUBLIC_SPIDER_BASE } from '$env/static/public';
import { cleanupAllNotifications, subscribeTasks } from './ws';
import { browser } from '$app/environment';

export async function addSpiderTask(uid: string | number) {
	if (browser) subscribeTasks([+uid]);
	return await fetch(`${PUBLIC_SPIDER_BASE}/${uid}`)
		.then(() => addNotification('success', '成功'))
		.catch(() => {
			addNotification('error', '出了些问题。请稍候再试。');
			cleanupAllNotifications();
		});
}

export async function addSpiderTasks(uids: number[]) {
	if (browser) subscribeTasks(uids);
	const result = await fetch(`${PUBLIC_SPIDER_BASE}/${uids.join(',')}`);
	if (result.ok) {
		addNotification('success', '成功');
	} else {
		addNotification('error', '出了些问题。请稍候再试。');
		cleanupAllNotifications();
	}
}
