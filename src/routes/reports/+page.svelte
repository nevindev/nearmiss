<script lang="ts">
	import ReportDetail from '$lib/components/ReportDetail.svelte';
	import { onMount } from 'svelte';
	// import type { PageProps } from './$types';
	import type { Report } from '$lib/types';
	import { db } from '$lib/db';

	// let { data }: PageProps = $props();
	let reports = $state<Report[]>([]);
	onMount(async () => (reports = await db.table('reports').toArray()));
</script>

{#if reports.length > 0}
	<ul class="px-2 mt-6 mb-16 grid grid-cols-1 gap-4 lg:grid-cols-2">
		{#each reports as report}
			<ReportDetail {report} />
		{/each}
	</ul>
{:else}
	<p class="mt-16 text-center text-xl font-bold text-slate-400">You have not created any reports</p>
{/if}
