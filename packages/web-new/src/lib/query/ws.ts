import { browser } from '$app/environment';
import { addNotification, removeNotification, updateNotification } from '$lib/state/notifications';
import { writable } from 'svelte/store';

let ws: WebSocket | null = null;
let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
let heartbeatInterval: ReturnType<typeof setInterval> | null = null;

export const connected = writable<boolean>(false);

const subscribedUsers: number[] = [];
const pendingUsers: number[] = [];

interface NotificationState {
	subscription: number | null; // 订阅状态通知ID
	queueing: Record<number, number>; // 用户ID -> 通知ID（排队状态）
	crawling: number | null; // 用户ID -> 通知ID（抓取状态）
	retrying: Record<number, number>; // 用户ID -> 通知ID（重试状态）
	success: number | null;
	pending: number | null;
}

const notificationState: NotificationState = {
	subscription: null,
	queueing: {},
	retrying: {},
	crawling: null,
	success: null,
	pending: null
};

let successCount = 0;

interface Message {
	type: 'task_success' | 'task_error' | 'task_progress' | 'task_retrying' | 'communication_error';
	data: { id: number; message: string };
}

const initializeWs = () => {
	if (ws) {
		clearHeartbeat();
		ws.close();
	}

	if (browser) {
		ws = new WebSocket('wss://spider.benben.sbs/ws');

		ws.onopen = () => {
			connected.set(true);
			startHeartbeat();

			if (reconnectTimeout) {
				clearTimeout(reconnectTimeout);
				reconnectTimeout = null;
			}
		};

		ws.onclose = () => {
			connected.set(false);
			clearHeartbeat();

			cleanupAllNotifications();
			reconnect();
		};

		ws.onmessage = (event) => {
			const data: Message = JSON.parse(event.data);

			if (pendingUsers.includes(data.data.id)) {
				pendingUsers.splice(pendingUsers.indexOf(data.data.id), 1);
				subscribedUsers.push(data.data.id);
				updateSubscriptionNotification();
			}

			switch (data.type) {
				case 'task_success':
					handleTaskSuccess(data);
					break;
				case 'task_error':
					handleTaskError(data);
					break;
				case 'task_progress':
					handleTaskProgress(data);
					break;
				case 'task_retrying':
					handleTaskRetrying(data);
					break;
				case 'communication_error':
					break;
			}
		};
	}

	return ws;
};

const handleTaskSuccess = (data: Message) => {
	removeUserStatusNotifications(data.data.id);

	successCount++;
	if (notificationState.success === null) {
		notificationState.success = addNotification(
			'success',
			`已成功抓取 ${successCount} 个用户的数据`,
			0,
			true
		);
	} else {
		updateNotification(
			notificationState.success,
			'success',
			`已成功抓取 ${successCount} 个用户的数据`,
			true
		);
	}
};

const handleTaskError = (data: Message) => {
	removeUserStatusNotifications(data.data.id);
	addNotification('error', `用户 ${data.data.id} 抓取失败: ${data.data.message}`);
};

const handleTaskProgress = (data: Message) => {
	if (notificationState.queueing[data.data.id]) {
		removeNotification(notificationState.queueing[data.data.id]);
		delete notificationState.queueing[data.data.id];
	}

	if (notificationState.retrying[data.data.id]) {
		removeNotification(notificationState.retrying[data.data.id]);
		delete notificationState.retrying[data.data.id];
	}

	if (notificationState.crawling) {
		updateNotification(
			notificationState.crawling,
			'info',
			`正在抓取用户 ${data.data.id} 的数据: ${data.data.message}`,
			true
		);
	} else {
		notificationState.crawling = addNotification(
			'info',
			`正在抓取用户 ${data.data.id} 的数据: ${data.data.message}`,
			0,
			true
		);
	}
};

const handleTaskRetrying = (data: Message) => {
	notificationState.retrying[data.data.id] = addNotification(
		'warning',
		`正在重试用户 ${data.data.id} 的抓取: ${data.data.message}`,
		0,
		true
	);
};

const updateSubscriptionNotification = () => {
	const pendingCount = pendingUsers.length;
	const subscribedCount = subscribedUsers.length;

	if (pendingCount > 0) {
		if (notificationState.pending === null) {
			notificationState.pending = addNotification(
				'info',
				`正在订阅 ${pendingCount} 个用户的爬虫状态...`,
				0,
				true
			);
		} else {
			updateNotification(
				notificationState.pending,
				'info',
				`正在订阅 ${pendingCount} 个用户的爬虫状态...`,
				true
			);
		}
	} else {
		if (notificationState.pending !== null) {
			removeNotification(notificationState.pending);
			notificationState.pending = null;
		}
	}
	if (subscribedCount > 0) {
		if (notificationState.subscription === null) {
			notificationState.subscription = addNotification(
				'info',
				`排队中用户：共 ${subscribedCount} 名`,
				0,
				true
			);
		} else {
			updateNotification(
				notificationState.subscription,
				'info',
				`排队中用户：共 ${subscribedCount} 名`,
				true
			);
		}
	} else {
		if (notificationState.subscription !== null) {
			removeNotification(notificationState.subscription);
			notificationState.subscription = null;
		}
	}

	return notificationState.subscription;
};

const removeUserStatusNotifications = (userId: number) => {
	const index = subscribedUsers.indexOf(userId);
	if (index !== -1) {
		subscribedUsers.splice(index, 1);
		updateSubscriptionNotification();
	}

	if (notificationState.queueing[userId]) {
		removeNotification(notificationState.queueing[userId]);
		delete notificationState.queueing[userId];
	}

	if (notificationState.retrying[userId]) {
		removeNotification(notificationState.retrying[userId]);
		delete notificationState.retrying[userId];
	}

	if (subscribedUsers.length === 0 && pendingUsers.length === 0) {
		if (notificationState.crawling) {
			removeNotification(notificationState.crawling);
			notificationState.crawling = null;
		}

		setTimeout(() => cleanupAllNotifications(), 3000);
	}
};

export const cleanupAllNotifications = () => {
	if (notificationState.subscription !== null) {
		removeNotification(notificationState.subscription);
		notificationState.subscription = null;
	}

	if (notificationState.success !== null) {
		removeNotification(notificationState.success);
		notificationState.success = null;
	}

	if (notificationState.crawling !== null) {
		removeNotification(notificationState.crawling);
	}

	// 清理所有用户状态通知
	Object.values(notificationState.queueing).forEach(removeNotification);
	Object.values(notificationState.retrying).forEach(removeNotification);

	notificationState.queueing = {};
	notificationState.crawling = null;
	notificationState.retrying = {};

	successCount = 0;
};

const reconnect = () => {
	if (reconnectTimeout) {
		clearTimeout(reconnectTimeout);
	}

	reconnectTimeout = setTimeout(() => {
		console.log('尝试重新连接WebSocket...');
		initializeWs();
	}, 3000);
};

const startHeartbeat = () => {
	clearHeartbeat();
	heartbeatInterval = setInterval(() => {
		if (ws && ws.readyState === WebSocket.OPEN) {
			ws.send(JSON.stringify({}));
		}
	}, 20 * 1000);
};

const clearHeartbeat = () => {
	if (heartbeatInterval) {
		clearInterval(heartbeatInterval);
		heartbeatInterval = null;
	}
};

const sendMessage = (message: any) => {
	if (!ws || ws.readyState !== WebSocket.OPEN) {
		return false;
	}

	try {
		ws.send(typeof message === 'string' ? message : JSON.stringify(message));
		return true;
	} catch (error) {
		return false;
	}
};

if (!ws) {
	initializeWs();
}

export const subscribeTasks = (uids: number[]) => {
	if (!ws || ws.readyState !== WebSocket.OPEN) {
		addNotification('warning', '无法订阅爬虫状态。');
		initializeWs();
		return null;
	}

	pendingUsers.push(...uids.filter((uid) => !pendingUsers.includes(uid)));

	const result = uids.map((uid) => {
		const result = sendMessage({ '+': { id: uid } });
		if (result) {
			pendingUsers.splice(pendingUsers.indexOf(uid), 1);
			if (!subscribedUsers.includes(uid)) {
				subscribedUsers.push(uid);
			}
		}
		return result;
	});

	if (result.some((res) => res === false)) {
		addNotification('error', '无法订阅部分爬虫状态。');
	}

	const notificationId = updateSubscriptionNotification();

	return notificationId;
};

export const unsubscribeTasks = (uids: number[]) => {
	if (!ws || ws.readyState !== WebSocket.OPEN) {
		return false;
	}

	const result = uids.map((uid) => {
		const pendingIndex = pendingUsers.indexOf(uid);
		if (pendingIndex !== -1) {
			pendingUsers.splice(pendingIndex, 1);
		}

		const subscribedIndex = subscribedUsers.indexOf(uid);
		if (subscribedIndex !== -1) {
			subscribedUsers.splice(subscribedIndex, 1);
		}

		removeUserStatusNotifications(uid);

		return sendMessage({ '-': { id: uid } });
	});

	updateSubscriptionNotification();

	return !result.some((res) => res === false);
};

export const unsubscribeAllTasks = () => {
	if (!ws || ws.readyState !== WebSocket.OPEN) {
		return false;
	}

	const allUsers = [...pendingUsers, ...subscribedUsers];
	pendingUsers.length = 0;
	subscribedUsers.length = 0;

	cleanupAllNotifications();

	const result = allUsers.map((uid) => {
		return sendMessage({ '-': { id: uid } });
	});

	return !result.some((res) => res === false);
};
