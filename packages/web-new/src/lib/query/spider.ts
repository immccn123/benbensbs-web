import { addNotification } from '$lib/state/notifications';
import { PUBLIC_SPIDER_BASE } from '$env/static/public';

export async function addSpiderTask(uid: string | number) {
	return await fetch(`${PUBLIC_SPIDER_BASE}/${uid}`)
		.then(() => addNotification('success', '成功'))
		.catch(() => addNotification('error', '出了些问题。请稍候再试。'));
}

export async function addSpiderTasks(uids: (string | number)[]) {
	const results = await Promise.allSettled(uids.map((uid) => fetch(`${PUBLIC_SPIDER_BASE}/${uid}`)));
	const total = results.length;
	const success = results.filter((r) => r.status === 'fulfilled').length;
	if (success === total) {
		addNotification('success', '成功');
	} else {
		addNotification('error', `出了些问题。请稍候再试。（成功率：${success}/${total}）`);
	}
}
