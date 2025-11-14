import { browser } from '$app/environment';

if (browser)
	if (location.hostname.includes('imken.dev')) {
		console.log('当前网址非主站；为了维护 imken.dev 的网址不被拦截，检测主站连通性后将自动跳转。');
		const sites = [
			'https://benben.sbs',
			'https://aws.benben.sbs',
			'https://eo.benben.sbs',
			'https://e.benben.sbs'
		];

		async function check() {
			while (true) {
				try {
					const winner = await Promise.race(
						sites.map((site) =>
							fetch(site, { method: 'HEAD', mode: 'no-cors' })
								.then(() => site)
								.catch(() => Promise.reject())
						)
					);
					location.href = winner + location.pathname + location.search + location.hash;
					await new Promise((resolve) => setTimeout(() => resolve(undefined), 1000));
				} catch (e) {}
			}
		}

		if (document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', check);
		} else {
			check();
		}
	}
