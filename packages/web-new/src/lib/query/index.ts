import { PUBLIC_API_BASE } from '$env/static/public';
import { createFetcher } from "$lib";
import { createQuery } from "@tanstack/svelte-query";

export const createHistoryUsernameQuery = (uid: number) => createQuery<string[]>({
    queryKey: ['/blackHistory/usernames/', uid ?? ''],
    queryFn: createFetcher(`/blackHistory/usernames/${uid}`),
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false
});

export const createDiagnosticQuery = () => createQuery<API.Diagnostic>({
    queryKey: ['/diagnostic'],
    queryFn: async () =>
        await fetch(`${PUBLIC_API_BASE}/diagnostic`).then((res) => res.json()),
    refetchInterval: 60000,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false
});