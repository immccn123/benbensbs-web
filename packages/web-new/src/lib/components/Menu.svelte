<script lang="ts">
	import MenuLink from './MenuLink.svelte';
	import { dropLeaf } from '$lib/state/leaf';
	import { addNotification } from '$lib/state/notifications';

	import MdiClose from '~icons/mdi/close';
	import MdiHomeOutline from '~icons/mdi/home-outline';
	import MdiDotsCircle from '~icons/mdi/dots-circle';
	import MdiHistory from '~icons/mdi/history';
	import MdiLeaf from '~icons/mdi/leaf';
	import MdiHubOutline from '~icons/mdi/hub-outline';
	import MdiCompare from '~icons/mdi/compare';
	import MdiSettings from '~icons/mdi/settings';

	import LgsLogo from '../../assets/lgslogo.svg?component';

	let leafClicks = 0;
	let leafRevealed = false;

	function handleLeafClick() {
		leafClicks++;
		if (leafClicks >= 5) {
			dropLeaf();
			if (!leafRevealed) {
				leafRevealed = true;
				addNotification('info', '叶子落了，路还在。', 5000);
			}
		}
	}
</script>

<ul
	class="
		menu menu-md bg-base-100 z-50 flex min-h-full
		max-lg:w-56 lg:fixed lg:top-0
		lg:w-[4rem] lg:shadow
	"
>
	<label for="sidebar-toggle" class="btn drawer-button btn-square btn-ghost mb-1 lg:hidden">
		<MdiClose width="1.8em" height="1.8em" />
	</label>
	<MenuLink to="/" fullMatch>
		<MdiHomeOutline width="24px" height="24px" slot="icon" />
		首页
	</MenuLink>
	<MenuLink to="/tools/circle">
		<MdiDotsCircle width="24px" height="24px" slot="icon" />
		犇圈
	</MenuLink>
	<MenuLink to="/fun/duel">
		<MdiCompare width="24px" height="24px" slot="icon" />
		相似度匹配
	</MenuLink>
	<MenuLink to="/user">
		<MdiHistory width="24px" height="24px" slot="icon" />
		用户历史
	</MenuLink>

	<MenuLink>
		<svg height="8px" width="28px" slot="icon">
			<line
				x1="0"
				y1="4"
				x2="24"
				y2="4"
				stroke="#333333"
				stroke-width="1"
				stroke-linecap="round"
			/>
		</svg>
	</MenuLink>

	<MenuLink to="https://olsi.benben.sbs">
		<MdiHubOutline width="24px" height="24px" slot="icon" />
		OLSI
	</MenuLink>

	<MenuLink to="https://www.luogu.me">
		<LgsLogo width="22px" height="24px" slot="icon" />
		洛谷保存站
	</MenuLink>

	<li class="invisible flex-grow"></li>
	<MenuLink>
		<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
		<span slot="icon" on:click={handleLeafClick}>
			<MdiLeaf width="24px" height="24px" />
		</span>
		<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
		<span on:click={handleLeafClick}>犇站 Defoliate Ver.</span>
	</MenuLink>
	<MenuLink to="/settings">
		<MdiSettings width="24px" height="24px" slot="icon" />
		设置
	</MenuLink>
</ul>

<style scoped>
	@media (min-width: 1024px) {
		:global(.menu *[data-content]) {
			width: 0;
			overflow: visible;
			text-wrap: nowrap;
			white-space: nowrap;
			opacity: 0;
			pointer-events: none;
			position: absolute;
			left: calc(32px + 1rem);
		}
	}

	:global(.menu li:hover *[data-content]) {
		display: unset;
		opacity: 1;
		pointer-events: auto;
	}
</style>
