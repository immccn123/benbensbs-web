import { browser } from '$app/environment';
import { addTask, removeTask, updateTask } from '$lib/state/notifications';
import { writable } from 'svelte/store';

let ws: WebSocket | null = null;
let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
let heartbeatInterval: ReturnType<typeof setInterval> | null = null;

export const connected = writable<boolean>(false);

const subscribedUsers: number[] = [];
const pendingUsers: number[] = [];

interface NotificationState {
	mainNotificationId: number | null;
	successCount: number;
	failureCount: number; // 新增：失败计数
	currentCrawlingUser: number | null;
	currentCrawlingMessage: string;
	retryingUsers: Set<number>;
}

const notificationState: NotificationState = {
	mainNotificationId: null,
	successCount: 0,
	failureCount: 0, // 新增：初始化失败计数
	currentCrawlingUser: null,
	currentCrawlingMessage: '',
	retryingUsers: new Set()
};

let cleanupTimeout: ReturnType<typeof setTimeout> | null = null;

interface Message {
	type: 'task_success' | 'task_error' | 'task_progress' | 'task_retrying' | 'communication_error';
	data: { id: number; message: string };
}

const buildNotificationMessage = (): string => {
	const parts: [string, number | string][] = [];
	let current: null | string = null;
	if (notificationState.currentCrawlingUser !== null) {
		current = `当前 ${notificationState.currentCrawlingUser}<br>`;
	}

	if (pendingUsers.length > 0) parts.push([`订阅中`, pendingUsers.length]);
	if (subscribedUsers.length > 0) parts.push([`排队`, subscribedUsers.length]);
	if (notificationState.retryingUsers.size > 0)
		parts.push([`重试`, notificationState.retryingUsers.size]);

	parts.push([
		`成功`,
		`<span class="text-green-800 dark:text-green-600">${notificationState.successCount}</span>`
	]);
	parts.push([
		`失败`,
		`<span class="text-red-800 dark:text-red-600">${notificationState.failureCount}</span>`
	]);

	return `${current ?? ''}${parts.map(([a]) => a).join(' / ')}: ${parts.map(([_, b]) => b).join(' / ')} 个用户`;
};

const updateMainNotification = () => {
	if (cleanupTimeout) {
		clearTimeout(cleanupTimeout);
		cleanupTimeout = null;
	}

	const hasActivity =
		pendingUsers.length > 0 ||
		subscribedUsers.length > 0 ||
		notificationState.retryingUsers.size > 0 ||
		notificationState.currentCrawlingUser !== null;

	if (!hasActivity) {
		if (notificationState.mainNotificationId !== null) {
			const totalTasks = notificationState.successCount + notificationState.failureCount;

			if (totalTasks > 0) {
				const summaryMessage = `任务完成: 成功 ${notificationState.successCount} / 失败 ${notificationState.failureCount}`;
				const summaryType = notificationState.failureCount > 0 ? 'warning' : 'success';

				updateTask(notificationState.mainNotificationId, summaryType, summaryMessage, false);

				cleanupTimeout = setTimeout(() => {
					if (notificationState.mainNotificationId !== null) {
						removeTask(notificationState.mainNotificationId);
						notificationState.mainNotificationId = null;
						notificationState.successCount = 0;
						notificationState.failureCount = 0;
					}
					cleanupTimeout = null;
				}, 5000);
			} else {
				removeTask(notificationState.mainNotificationId);
				notificationState.mainNotificationId = null;
				notificationState.successCount = 0;
				notificationState.failureCount = 0;
			}
		}
		return;
	}

	const message = buildNotificationMessage();
	const type = notificationState.retryingUsers.size > 0 ? 'warning' : 'loading';

	if (notificationState.mainNotificationId === null) {
		notificationState.mainNotificationId = addTask(type, message, 0, true);
	} else {
		updateTask(notificationState.mainNotificationId, type, message, true);
	}
};

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

			updateMainNotification();
		};
	}

	return ws;
};

const handleTaskSuccess = (data: Message) => {
	removeUserFromTracking(data.data.id);
	notificationState.successCount++;
};

const handleTaskError = (data: Message) => {
	removeUserFromTracking(data.data.id);
	notificationState.failureCount++;
	addTask('error', `用户 ${data.data.id} 抓取失败: ${data.data.message}`);
};

const handleTaskProgress = (data: Message) => {
	notificationState.retryingUsers.delete(data.data.id);
	notificationState.currentCrawlingUser = data.data.id;
	notificationState.currentCrawlingMessage = data.data.message;
};

const handleTaskRetrying = (data: Message) => {
	notificationState.retryingUsers.add(data.data.id);
};

const removeUserFromTracking = (userId: number) => {
	const index = subscribedUsers.indexOf(userId);
	if (index !== -1) subscribedUsers.splice(index, 1);

	notificationState.retryingUsers.delete(userId);

	if (notificationState.currentCrawlingUser === userId) {
		notificationState.currentCrawlingUser = null;
		notificationState.currentCrawlingMessage = '';
	}
};

export const cleanupAllNotifications = () => {
	if (cleanupTimeout) {
		clearTimeout(cleanupTimeout);
		cleanupTimeout = null;
	}

	if (notificationState.mainNotificationId !== null) {
		removeTask(notificationState.mainNotificationId);
		notificationState.mainNotificationId = null;
	}

	notificationState.successCount = 0;
	notificationState.failureCount = 0; // 重置失败计数
	notificationState.currentCrawlingUser = null;
	notificationState.currentCrawlingMessage = '';
	notificationState.retryingUsers.clear();
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
		addTask('warning', '无法订阅爬虫状态。');
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
		addTask('error', '无法订阅部分爬虫状态。');
	}

	updateMainNotification();
	return notificationState.mainNotificationId;
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

		removeUserFromTracking(uid);

		return sendMessage({ '-': { id: uid } });
	});

	updateMainNotification();
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
