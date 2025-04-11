<script lang="ts">
	// import GeospatialInput from '$lib/components/forms/elements/GeospatialInput.svelte';
	import SimpleMapForm from '$lib/components/forms/SimpleMapForm.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import { reportsToFeatureCollection, getPosition, positionToFeature } from '$lib/geoutils';
	import type { PageProps } from '../$types';
	import type { Position, Feature, FeatureCollection } from 'geojson';
	import { createReport, updateReportPosition, db } from '$lib/db';
	import type { Report } from '$lib/types';

	let fallback = [-77.357, 38.9586];

	let { data }: PageProps = $props();

	let activeFeature = $state<Feature>();

	let featureCollection = $state<FeatureCollection>(reportsToFeatureCollection(data.reports));
	let center = $derived.by(() => {
		return activeFeature && activeFeature.geometry.type === 'Point'
			? activeFeature.geometry.coordinates
			: fallback;
	});

	async function handleFeatureAdded(position: Position) {
		const id = await createReport(new Date(), position);
		if (id !== null) {
			updateReports();
		}
	}

	async function handleFeatureUpdated(position: Position, feature: Feature) {
		if (feature.properties?.id) {
			const id = await updateReportPosition(position, feature.properties.id);
			if (id !== null) {
				updateReports();
			}
		}
	}

	async function handleFeatureRemoved(feature: Feature) {
		if (feature.properties?.id) {
			await db.reports.delete(feature.properties.id);
			updateReports();
		}
	}

	async function updateReports() {
		let reports: Report[] = await db.table('reports').toArray();
		featureCollection = reportsToFeatureCollection(reports);
	}
</script>

<div class="-mt-16 flex h-svh w-screen flex-col items-center">
	{#await getPosition(fallback)}
		<SimpleMapForm
			mode="map"
			{center}
			updateCancellable={true}
			permissionGranted={false}
			bind:features={featureCollection.features}
			{activeFeature}
			limit={Infinity}
			featureAdded={(position) => handleFeatureAdded(position)}
			featureUpdated={(position, feature) => handleFeatureUpdated(position, feature)}
			featureRemoved={(feature) => handleFeatureRemoved(feature)}
		/>
		<Spinner><p>Attempting to locate your position...</p></Spinner>
	{:then { permission, position }}
		<SimpleMapForm
			mode="map"
			center={position ? position : center}
			permissionGranted={permission === 'granted'}
			updateCancellable={true}
			bind:features={featureCollection.features}
			{activeFeature}
			limit={Infinity}
			featureAdded={(position) => handleFeatureAdded(position)}
			featureUpdated={(position, feature) => handleFeatureUpdated(position, feature)}
			featureRemoved={(feature) => handleFeatureRemoved(feature)}
		/>
	{/await}
</div>
