import 'unplugin-icons/types/svelte';
import 'vite-plugin-pwa/svelte';
import 'vite-plugin-pwa/client';
import 'vite-plugin-pwa/info';

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	const __VERSION__: string | undefined;
	const __LASTMOD__: string | undefined;

	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	namespace API {
		export interface Duel {
			divergence: number;
			duplicate_rate: number;
			entropy: {
				mean_ratio: number;
				std_diff: number;
			};
			sample_count_a: number;
			sample_count_b: number;
			topic_resonance: number;
			uid_a: number;
			uid_b: number;
		}

		export type Heatmap = {
			date: string;
			count: number;
		}[];

		export interface TakedownInfo {
			batch_id: number;
			reason: string;
			takedown_time: string;
			takedown_user_id: number;
		}

		export interface BenbenTakedown {
			takedown: true;
			takedown_info: TakedownInfo;
		}

		export interface Benben {
			id: number;
			username: string;
			time: string;
			content: string;
			grabTime: string;
			userId: number;
		}

		export interface Stat {
			today_count: number;
			total_count: number;
		}

		export type ProcessState =
			| 'STOPPED'
			| 'STARTING'
			| 'RUNNING'
			| 'BACKOFF'
			| 'STOPPING'
			| 'EXITED'
			| 'FATAL'
			| 'UNKNOWN';

		export interface ProcStatus {
			fetcher_status: ProcessState;
			loop_status: ProcessState;
		}

		export interface Diagnostic {
			$monitor: string;
			database: 'up' | 'down';
			redis: 'up' | 'down';
			version: string;
		}

		export interface UserBenbens {
			feeds: Benben[];
			count: number;
		}

		export interface BenbenCircleResponse {
			benbenCnt: number;
			cacheHit: boolean;
			result: {
				uid: number;
				weight: number;
			}[];
		}
	}
}

export {};
