// @ts-nocheck

(async () => {
	const reg = /https:\/\/www.luogu.com(.cn)?\/user\/(\d+)/;
	const uid = location.href.match(reg)?.[2];

	if (typeof (uid ?? undefined) === 'undefined') {
		alert('请确认正在个人中心执行本段代码。');
	} else {
		console.log('正在获取关注列表，请耐心等待。');
		const followings = [];
		let page = 1;
		outer: while (true) {
			let retries = 0;
			while (retries < 5) {
				await new Promise((resolve) => setTimeout(resolve, 10000 * retries));
				try {
					const res = await fetch(
						`https://www.luogu.com.cn/api/user/followings?user=${uid}&page=${page}`
					);
					const json = await res.json();
					const uids = json.users.result.map((x) => x.uid);
					followings.push(...uids);
					console.log(`第 [${page}] 页：已获取 ${uids.length}（累计 ${followings.length}）条数据`);
					if (uids.length < 20) break outer;
					page++;
					break;
				} catch (e) {
					retries++;
					console.warn(`请求出现错误，等待 ${10 * (retries + 1)} 秒后重试……`);
				}
			}
			if (retries >= 5) {
				console.error('重试超过限制次数，请稍后再试。');
			}
		}

		console.log("现在可以选中复制下列结果：")
		console.log(followings.join(', '));
	}
})();
