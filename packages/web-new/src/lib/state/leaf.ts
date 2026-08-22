import { writable } from 'svelte/store';

export const leafDrop = writable(0);

export const dropLeaf = () => leafDrop.update((n) => n + 1);
