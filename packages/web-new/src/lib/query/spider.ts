import { addNotification } from '$lib/state/notifications';

export async function addSpiderTask(uid: string | number) {
	return await fetch(`https://spider.benben.sbs/${uid}`)
		.then(() => addNotification('success', '成功'))
		.catch(() => addNotification('error', '出了些问题。请稍候再试。'));
}

export async function addSpiderTasks(uids: (string | number)[]) {
	const promises = Promise.allSettled(uids.map((uid) => fetch(`https://spider.benben.sbs/${uid}`)));
	return promises
		.then(() => addNotification('success', '成功'))
		.catch(() => addNotification('error', '出了些问题。请稍候再试。'));
}
