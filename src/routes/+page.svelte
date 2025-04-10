<script lang="ts">
	import type { Position } from 'geojson';
	import type { PageProps } from './$types';
	import { getPosition } from '$lib/geoutils';
	import type { Report } from '$lib/types';
	import { createReport, db } from '$lib/db';
	import RadialProgress from '$lib/components/RadialProgress.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import { onMount } from 'svelte';

	let { data }: PageProps = $props();

	let countdown = $state<number>();
	let totalCount = $state<number>(5);
	let permission = $state<PermissionState>();
	let position = $state<Position>();
	let report = $state<Report>();

	let valid = $derived.by(
		() =>
			position &&
			permission &&
			permission !== 'denied' &&
			(!Number.isNaN(position[0]) || !Number.isNaN(position[1]))
	);

	onMount(async () => {
		let result = await getPosition([NaN, NaN]);
		permission = result.permission;
		position = result.position;
		countdown = totalCount;
	});

	$effect(() => {
		const interval = setInterval(() => {
			if (countdown !== undefined && valid && position) {
				countdown -= 1;
				if (countdown < 0) {
					countdown = 0;
					autoReport(position);
					countdown = undefined;
				}
			}
		}, 1_000);

		return () => {
			clearInterval(interval);
		};
	});

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
		<div class="mx-auto min-h-full max-w-full space-y-6 py-6 sm:px-6 lg:px-8">
			<p class="text-center text-3xl font-bold text-slate-700">Report Saved!</p>
			<RadialProgress progress={100} complete={true} text={'✓'} />
		</div>

		<a
			href="/reports/{report.id}"
			class="pointer-events-auto rounded-md px-4 py-2 font-bold text-black hover:bg-slate-200"
			>View report</a
		>
	{:else}
		{#key permission}
			{#await getPosition()}
				<Spinner><p>Attempting to locate your position...</p></Spinner>
			{:then { permission, position }}
				{#if position !== undefined}
					<div class="mx-auto min-h-full max-w-full space-y-6 py-6 sm:px-6 lg:px-8">
						<p class="text-center text-3xl font-bold text-slate-700">Automatically Reporting in</p>
						{#if countdown !== undefined}
							<RadialProgress
								progress={(countdown / totalCount) * 100}
								text={`${countdown.toString()} ${countdown == 1 ? 'second' : 'seconds'}`}
							/>
						{:else}
							<RadialProgress indeterminate={true} />
						{/if}
					</div>

					<button
						class="pointer-events-auto rounded-md px-4 py-2 font-bold text-black hover:bg-slate-200"
						onclick={() => (countdown = undefined)}>Cancel</button
					>
				{:else}
					<p class="text-lg font-bold text-slate-700">Could not get your location.</p>
					<p>A report cannot be automatically created.</p>
				{/if}
			{/await}
		{/key}
	{/if}
</div>
