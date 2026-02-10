<script lang="ts">
	import Map from '$lib/components/maps/EnhancedMap.svelte';
	import Spinner from '$lib/components/ui/Spinner.svelte';
	import {
		reportsToFeatureCollection,
		getPosition,
		reportToFeature,
		positionToPoint
	} from '$lib/geoutils';
	import type { PageProps } from '../$types';
	import type { Position, Feature, FeatureCollection } from 'geojson';
	import { createReport, updateReportPosition, db } from '$lib/db';
	import type { GeoJSONFeatureDiff, GeoJSONFeatureId } from 'maplibre-gl';

	const fallback = [-77.357, 38.9586];
	let { data }: PageProps = $props();

	let activeFeature = $state<Feature | undefined>(
		data.selected ? reportToFeature(data.selected, true) : undefined
	);

	let featureCollection = $state<FeatureCollection>(reportsToFeatureCollection(data.reports));
	let sourceName = $state("Report")
	let map = $state<ReturnType<typeof Map>>();

	async function handleFeatureAdded(position: Position) {
		const id = await createReport(new Date(), position);
		if (id !== null) {
			let report = await db.reports.get(id);
			if (map !== undefined && report !== undefined) {
				let feature = reportToFeature(report, true);
				map.addFeature(sourceName, feature);
				map.setFeatureActive(feature);
			}
		}
	}

	async function handleFeatureUpdated(position: Position, featureId: GeoJSONFeatureId) {
		const id = await updateReportPosition(position, featureId);
		if (map !== undefined && id !== null) {
			let featureDiff: GeoJSONFeatureDiff = {
				id: featureId,
				newGeometry: positionToPoint(position),
				addOrUpdateProperties: [{ key: 'icon', value: 'active' }]
			};
			map.updateFeature(sourceName, [featureDiff]);
		}
	}

	async function handleFeatureRemoved(featureId: GeoJSONFeatureId) {
		await db.reports.delete(featureId);
		// featureCollection.features = await db.table('reports').toArray()
		if (map !== undefined) {
			map.removeFeature(sourceName, featureId);
		}
	}
</script>

<div class="-mt-16 flex h-svh w-screen flex-col items-center">
	{#await getPosition(fallback)}
		<Map
			bind:this={map}
			mode="map"
			permissionGranted={false}
			{sourceName}
			{activeFeature}
			features={featureCollection.features}
			limit={Infinity}
			featureAdded={(position) => handleFeatureAdded(position)}
			featureUpdated={(position, featureId) => handleFeatureUpdated(position, featureId)}
			featureRemoved={(featureId) => handleFeatureRemoved(featureId)}
		/>
		<Spinner><p>Attempting to locate your position...</p></Spinner>
	{:then { permission, position }}
		<Map
			bind:this={map}
			mode="map"
			permissionGranted={permission === 'granted'}
			{sourceName}
			{activeFeature}
			features={featureCollection.features}
			limit={Infinity}
			center={position}
			featureAdded={(position) => handleFeatureAdded(position)}
			featureUpdated={(position, featureId) => handleFeatureUpdated(position, featureId)}
			featureRemoved={(featureId) => handleFeatureRemoved(featureId)}
		/>
	{/await}
</div>
