<script lang="ts">
	import type { Position } from 'geojson';
	import { getPosition } from '$lib/geoutils';
	import type { Report } from '$lib/types';
	import { createReport, db } from '$lib/db';
	import RadialProgress from '$lib/components/RadialProgress.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import Countdown from '$lib/components/Countdown.svelte';

	let report = $state<Report>();
	async function autoReport(position: Position) {
		try {
			const now = new Date();
			const report_id = await createReport(now, $state.snapshot(position));
			if (report_id) {
				report = await db.reports.get(report_id);
			}
		} catch (error: unknown) {
			console.log(error);
		}
	}
</script>

<div class="mt-18 flex flex-col items-center justify-center">
	{#if report}
		<p class="text-center text-3xl font-bold text-slate-700">Report Saved!</p>
		<div class="mx-auto min-h-full max-w-full space-y-6 py-6 text-center sm:px-6 lg:px-8">
			<RadialProgress progress={100} complete={true} text={'✓'} />

			<a
				href="/reports/{report.id}"
				class="pointer-events-auto rounded-md px-4 py-2 font-bold text-black hover:bg-slate-200"
				>Take Survey</a
			>
		</div>
	{:else}
		{#await getPosition()}
			<Spinner><p>Attempting to locate your position...</p></Spinner>
		{:then { permission, position }}
			{#if position !== undefined}
				<p class="text-center text-3xl font-bold text-slate-700">Automatically Reporting in</p>
				<Countdown onTimeout={() => autoReport(position)} />
			{:else}
				<p class="text-lg font-bold text-slate-700">Could not get your location.</p>
				<p>A report cannot be automatically created.</p>
			{/if}
		{/await}
	{/if}
</div>
