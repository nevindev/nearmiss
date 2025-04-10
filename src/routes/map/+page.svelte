<script lang="ts">
	// import GeospatialInput from '$lib/components/forms/elements/GeospatialInput.svelte';
	import SimpleMapForm from '$lib/components/forms/SimpleMapForm.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import { reportsToFeatureCollection, getPosition, positionToFeature } from '$lib/geoutils';
	import type { PageProps } from '../$types';
	import type { Position, Feature, FeatureCollection } from 'geojson';
	import { createReport, updateReportPosition, db } from '$lib/db';

	let fallback = [-77.357, 38.9586];

	let { data }: PageProps = $props();

	let featureCollection = $state<FeatureCollection>(reportsToFeatureCollection(data.reports));
	let center = $derived.by(() => {
		let feature = featureCollection.features.at(0);
		return feature && feature.geometry.type === 'Point' ? feature.geometry.coordinates : fallback;
	});

	// async function handleFeature(feature: Feature) {
	// 	if (feature.geometry.type == 'Point') {
	// 		const id = await createReport(new Date(), feature.geometry.coordinates);
	// 		console.log(id);
	// 	}
	// }

	async function handleFeatureRequested(position: Position, id?: number | string) {
		let reportId = null;
		if (id !== undefined) {
			reportId = await updateReportPosition(position, id);
		} else {
			reportId = await createReport(new Date(), position);
		}

		if (reportId !== null) {
			let reports = await db.table('reports').toArray();
			featureCollection = reportsToFeatureCollection(reports);
		}
	}
</script>

<div class="-mt-16 flex h-svh w-screen flex-col items-center">
	{#await getPosition(fallback)}
		<SimpleMapForm
			{center}
      updateCancellable={true}
			permissionGranted={false}
			bind:features={featureCollection.features}
			limit={Infinity}
			featureRequested={(position, id) => handleFeatureRequested(position, id)}
		/>
		<Spinner><p>Attempting to locate your position...</p></Spinner>
	{:then { permission, position }}
		<SimpleMapForm
			center={position ? position : center}
			permissionGranted={permission === 'granted'}
      updateCancellable={true}
			bind:features={featureCollection.features}
			limit={Infinity}
			featureRequested={(position, id) => handleFeatureRequested(position, id)}
		/>
	{/await}
</div>
