<script lang="ts">
	import { onMount } from 'svelte';

	import MdiDatabase from '~icons/mdi/database';
	import MdiLinkVariant from '~icons/mdi/link-variant';
	import MdiAlertCircleOutline from '~icons/mdi/alert-circle-outline';
	import MdiAccountCheck from '~icons/mdi/account-check';
	import MdiShieldOff from '~icons/mdi/shield-off';
	import MdiAccountSearch from '~icons/mdi/account-search';
	import MdiApplicationCog from '~icons/mdi/application-cog';
	import MdiShieldCheck from '~icons/mdi/shield-check';
	import MdiAccountKey from '~icons/mdi/account-key';
	import MdiShieldLock from '~icons/mdi/shield-lock';
	import MdiCookieAlert from '~icons/mdi/cookie-alert';

	import disclaimerContent from '../../routes/legal/disclaimer/policy.md?raw';
	import privacyContent from '../../routes/legal/privacy/policy.md?raw';

	import MarkdownIt from 'markdown-it';
	import { fade } from 'svelte/transition';

	const md = new MarkdownIt();

	let showModal = false;
	let holdProgress = 0;
	let isHolding = false;
	let holdInterval: any;

	let ok = false;

	onMount(() => {
		const hasAgreed = localStorage.getItem('disclaimerAgreed');
		if (!hasAgreed) {
			showModal = true;
		}
	});

	function startHold() {
		isHolding = true;
		holdProgress = 0;

		holdInterval = setInterval(() => {
			holdProgress += 2;
			if (holdProgress >= 100) {
				clearInterval(holdInterval);
				localStorage.setItem('disclaimerAgreed', 'true');
				showModal = false;
			}
		}, 20);
	}

	function stopHold() {
		isHolding = false;
		clearInterval(holdInterval);
		holdProgress = 0;
	}
</script>

{#if showModal}
	<div class="modal modal-open" out:fade={{ duration: 100 }}>
		<div class="modal-box max-h-[80vh] max-w-4xl">
			<div class="mb-6">
				<h3 class="mb-2 text-3xl font-bold">欢迎使用犇站</h3>
				<p class="text-base-content/60">请阅读下列条款以继续使用。</p>
			</div>

			<div class="divider"></div>

			<h4 class="mb-2 ml-2 text-xl font-bold">免责声明</h4>

			<ul class="list bg-base-200 mb-2 rounded-2xl">
				<li class="p-4 pb-2 text-sm">简而言之：</li>

				<li class="list-row">
					<div><MdiDatabase class="size-10" /></div>
					<div>
						<div><p class="font-bold">数据来自第三方</p></div>
						<div class="text-sm">数据来自外部公开源，本站不生产或编辑原始内容。</div>
					</div>
				</li>

				<li class="list-row">
					<div><MdiLinkVariant class="size-10" /></div>
					<div>
						<div><p class="font-bold">外部链接风险自担</p></div>
						<div class="text-sm">
							外链内容由第三方负责，安全性与合法性不由本站保证。
						</div>
					</div>
				</li>

				<li class="list-row">
					<div><MdiAlertCircleOutline class="size-10" /></div>
					<div>
						<div><p class="font-bold">准确性与时效性不保证</p></div>
						<div class="text-sm">
							数据可能存在误差、滞后或不完整，本站无法保证绝对准确。
						</div>
					</div>
				</li>

				<li class="list-row">
					<div><MdiAccountCheck class="size-10" /></div>
					<div>
						<div><p class="font-bold">用户需自行判断与验证</p></div>
						<div class="text-sm">用户应独立分析并在必要时通过权威渠道验证数据。</div>
					</div>
				</li>

				<li class="list-row">
					<div><MdiShieldOff class="size-10" /></div>
					<div>
						<div><p class="font-bold">损失与不可抗力免责</p></div>
						<div class="text-sm">
							因数据误差、服务中断或不可抗力导致的损失，本站不承担责任。
						</div>
					</div>
				</li>

				<li class="p-4 py-3 text-sm">
					以上内容仅概述了实际许可协议的部分关键特征和条款，并非正式许可协议，不具备法律效力。您应仔细阅读并遵守实际许可协议的所有条款和条件。
				</li>
			</ul>

			<div class="collapse-arrow bg-base-200 collapse">
				<input type="checkbox" />
				<div class="collapse-title font-semibold">《免责声明》全文</div>
				<div class=" collapse-content">
					<div
						class="custom-scrollbar prose prose-sm max-h-64 max-w-none overflow-y-auto p-2"
					>
						{@html md.render(disclaimerContent)}
					</div>
				</div>
			</div>

			<div class="divider"></div>

			<h4 class="mb-2 ml-2 text-xl font-bold">隐私协议</h4>

			<ul class="list bg-base-200 mb-2 rounded-2xl">
				<li class="list-row">
					<div><MdiAccountSearch class="size-10" /></div>
					<div>
						<p class="font-bold">我们收集哪些信息</p>
						<div class="text-sm">
							可能包括您提供的个人信息、自动收集的设备与使用数据，以及从公开来源抓取的外部数据。
						</div>
					</div>
				</li>

				<li class="list-row">
					<div><MdiApplicationCog class="size-10" /></div>
					<div>
						<p class="font-bold">使用的第三方服务</p>
						<div class="text-sm">
							我们使用 Microsoft Clarity、Google Analytics、Google AdSense、Cloudflare
							Analytics 等服务，这些服务可能收集并处理您的技术或行为数据。
						</div>
					</div>
				</li>

				<li class="list-row">
					<div><MdiCookieAlert class="size-10" /></div>
					<div>
						<p class="font-bold">Cookies 与本地存储的使用</p>
						<div class="text-sm">
							本站会使用 Cookies、LocalStorage、SessionStorage
							来保存会话设置、偏好、统计数据，并用于提高服务体验。
						</div>
					</div>
				</li>

				<li class="list-row">
					<div><MdiShieldCheck class="size-10" /></div>
					<div>
						<p class="font-bold">我们如何使用您的信息</p>
						<div class="text-sm">
							用于提供与改进服务、安全保障、分析趋势、客户支持与遵守法律义务；不会出售用于独立营销。
						</div>
					</div>
				</li>

				<li class="list-row">
					<div><MdiAccountKey class="size-10" /></div>
					<div>
						<p class="font-bold">您的权利与选择</p>
						<div class="text-sm">
							依地区法律，您可能拥有访问、更正、删除、限制处理、数据可携或撤回同意等权利。
						</div>
					</div>
				</li>

				<li class="list-row">
					<div><MdiShieldLock class="size-10" /></div>
					<div>
						<p class="font-bold">信息安全与政策变更</p>
						<div class="text-sm">
							我们采取合理措施保护您的信息，但无法保证其绝对安全。隐私协议可能随时更新。
						</div>
					</div>
				</li>

				<li class="p-4 py-3 text-sm">
					以上内容仅概述了实际许可协议的部分关键特征和条款，并非正式许可协议，不具备法律效力。您应仔细阅读并遵守实际许可协议的所有条款和条件。
				</li>
			</ul>

			<div class="collapse-arrow bg-base-200 collapse">
				<input type="checkbox" />
				<div class="collapse-title font-semibold">《隐私协议》全文</div>
				<div class=" collapse-content">
					<div
						class="custom-scrollbar prose prose-sm max-h-64 max-w-none overflow-y-auto p-2"
					>
						{@html md.render(privacyContent)}
					</div>
				</div>
			</div>

			<div class="divider"></div>

			<label class="label mb-2 text-sm">
				<input type="checkbox" bind:checked={ok} class="checkbox" />
				我已阅读、理解并同意《免责声明》《隐私协议》
			</label>

			<div class="flex flex-col items-center gap-3">
				<button
					class="btn btn-primary btn-lg relative w-64 overflow-hidden"
					on:mousedown={startHold}
					on:mouseup={stopHold}
					on:mouseleave={stopHold}
					on:touchstart={startHold}
					on:touchend={stopHold}
					disabled={!ok}
				>
					<div
						class="duration-25 absolute left-0 top-0 z-20 h-full bg-black/20 transition-all"
						style="width: {holdProgress}%"
					></div>
					<span class="relative z-10">
						{#if ok}
							长按以继续
						{:else}
							请先同意许可条款
						{/if}
					</span>
				</button>

				<button class="btn btn-ghost btn-sm" disabled> 不同意请关闭页面 </button>
			</div>
		</div>
	</div>
{/if}
