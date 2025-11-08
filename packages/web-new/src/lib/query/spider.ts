import { addTask, removeTask, updateTask } from '$lib/state/notifications';
import { PUBLIC_SPIDER_BASE } from '$env/static/public';
import { cleanupAllNotifications, subscribeTasks } from './ws';
import { browser } from '$app/environment';

export async function addSpiderTask(uid: string | number) {
	return await addSpiderTasks([+uid]);
}

export async function addSpiderTasks(uids: number[]) {
	if (browser) subscribeTasks(uids);
	let taskId = addTask('loading', '正在向爬虫请求抓取', 0, true);
	try {
		const result = await fetch(`${PUBLIC_SPIDER_BASE}/${uids.join(',')}`);
		if (result.ok) {
			updateTask(taskId, 'success', '成功向爬虫请求抓取。', false);
		} else {
			updateTask(taskId, 'error', '在向爬虫请求抓取时出错。', false);
			cleanupAllNotifications();
		}
	} catch {
		updateTask(taskId, 'error', '在向爬虫请求抓取时出错。', false);
		cleanupAllNotifications();
	} finally {
		setTimeout(() => removeTask(taskId), 3000);
	}
}
