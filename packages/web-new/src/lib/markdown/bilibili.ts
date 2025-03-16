import type { PluginSimple } from 'markdown-it';

const BILIBILI_REGEX = /^bilibili:((?:av\d+|BV\w+|\d+))(?:[?](.*))?$/i;

const bilibiliPlugin: PluginSimple = (md) => {
	const defaultRender = md.renderer.rules.image!;

	md.renderer.rules.image = (tokens, idx, options, env, self) => {
		const token = tokens[idx];
		const src = token.attrGet('src');

		if (src && src.startsWith('bilibili:')) {
			const match = src.match(BILIBILI_REGEX);

			if (!match) return defaultRender(tokens, idx, options, env, self);

			const [_, videoId, query] = match;
			const params = new URLSearchParams(query);

			let videoParams = {} as any;
			if (/^av\d+$/i.test(videoId)) {
				videoParams.aid = videoId.replace(/av/gi, '');
			} else if (/^\d+$/.test(videoId)) {
				videoParams.aid = videoId;
			} else if (/^BV/i.test(videoId)) {
				videoParams.bvid = videoId;
			} else {
				return defaultRender(tokens, idx, options, env, self);
			}

			if (params.has('page')) videoParams.page = params.get('page');
			if (params.has('t')) videoParams.t = params.get('t');

			const playerUrl = new URL('https://player.bilibili.com/player.html');
			Object.entries(videoParams).forEach(([k, v]) => playerUrl.searchParams.set(k, v as string));

			return `<div class="bilibili-embed"><iframe src="${playerUrl.toString()}" loading="lazy" width="100%" height="450"
					scrolling="no" frameborder="no" framespacing="0" allowfullscreen="true"
					allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
					style="max-width: 800px; border-radius: 8px; margin: 1rem 0;"></iframe></div>`;
		}

		return defaultRender(tokens, idx, options, env, self);
	};
};

export default bilibiliPlugin;
