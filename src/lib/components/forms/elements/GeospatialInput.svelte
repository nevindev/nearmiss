<script lang="ts">
	import Map from '../../maps/EnhancedMap.svelte';
	import { page } from '$app/state';
	import {
		type GeoJSONFeatureId,
		type GeoJSONFeatureDiff,
		type GeoJSONSourceDiff
	} from 'maplibre-gl';
	import { type Feature, type Position } from 'geojson';
	import { getPosition, positionToFeature, positionToPoint, updateProperty } from '$lib/geoutils';
	import {
		featuresFromURLSearchParams,
		featureToPositionURLString,
		positionToURLString
	} from '$lib/geoutils';
	import Spinner from '$lib/components/ui/Spinner.svelte';
	import { onMount } from 'svelte';

	type Props = {
		key: string;
		limit?: number;
		fallback?: Position;
		required?: boolean;
		useUrlParams?: boolean;
		inputChanged: (invalid: boolean) => void;
		// invalid?: boolean;
	};

	let {
		key = 'location',
		limit = 1,
		fallback = [-77.357, 38.9586],
		required = false,
		useUrlParams = false,
		inputChanged
	}: Props = $props();


	let noun = $state<string>('Location');
	let sourceName = $derived(`${noun}s`.toLowerCase())

	let map = $state<ReturnType<typeof Map>>();
	let features = $state(
		useUrlParams ? featuresFromURLSearchParams(page.url.searchParams, key) : []
	);
	// let activeFeature = $derived(useUrlParams && features.length === limit ? features.at(-1) : undefined)
	let activeFeature = $derived.by(() => {
		if (useUrlParams && features.length === 1) {
			return features.at(0)
		} else if (useUrlParams && features.length === limit) {
			return features.at(-1)
		} else {
			return undefined
		}
	})

	let center: Position = $derived.by(() => {
		return activeFeature && activeFeature.geometry.type === 'Point'
			? activeFeature.geometry.coordinates
			: fallback;
	});

	let location: string = $derived(featureToPositionURLString(activeFeature));

	let invalid = $derived.by(() => features.every((feature) => invalidFeature(feature)));

	function invalidFeature(feature: Feature) {
		return (
			feature.geometry.type !== 'Point' ||
			feature.properties?.id === null ||
			Number.isNaN(feature.geometry.coordinates[0]) ||
			Number.isNaN(feature.geometry.coordinates[1])
		);
	}

	function updateURLSearchParams(key: string) {
		page.url.searchParams.delete(key);
		features.forEach((feature) =>
			page.url.searchParams.append(key, featureToPositionURLString(feature))
		);
		window.history.pushState({}, '', '?' + $state.snapshot(page.url.searchParams.toString()));
	}

	// function deactivateAll(features: Feature[]): GeoJSONFeatureDiff[] {
	// 	return features
	// 		.filter((feature) => feature.id !== undefined)
	// 		.map((feature) => {
	// 			let diff: GeoJSONFeatureDiff = {
	// 				id: feature.id ? feature.id : -1,
	// 				addOrUpdateProperties: [{ key: 'icon', value: (feature.id = 'default') }]
	// 			};
	// 			return diff;
	// 		});
	// }

	async function handleFeatureAdded(position: Position) {
		if (map !== undefined) {
			let feature = positionToFeature(position, features.length + 1, features.length + 1 === limit);
			map.addFeature(noun, feature);
			if (features.length < limit) {
				map.addFeature(key, feature);
				features = [...features, feature];
				// map.addFeature(sourceName, feature);
				
			} 
			updateURLSearchParams(key);
		}
	}

	async function handleFeatureUpdated(position: Position, featureId: GeoJSONFeatureId) {
		if (map !== undefined) {
			let featureDiff: GeoJSONFeatureDiff = {
				id: featureId,
				newGeometry: positionToPoint(position),
				addOrUpdateProperties: updateProperty(true)
			};
			map.updateFeature(key, [featureDiff]);
			updateURLSearchParams(key);
		}
	}

	async function handleFeatureRemoved(featureId: GeoJSONFeatureId) {
		features = features.filter((feature) => feature.id !== featureId)
		if (map !== undefined) {
			map.removeFeature(key, featureId);
			updateURLSearchParams(key);
		}
	}
</script>

<input
	class="pointer-events-none invisible h-0"
	type="text"
	name={key}
	value={location}
	{required}
/>

{#await getPosition(fallback)}
	<Map
		bind:this={map}
		mode="form"
		sourceName = {key}
		{center}
		permissionGranted={false}
		{features}
		{activeFeature}
		{limit}
		featureAdded={(position) => handleFeatureAdded(position)}
		featureUpdated={(position, feature) => handleFeatureUpdated(position, feature)}
		featureRemoved={(featureId) => handleFeatureRemoved(featureId)}
	/>
	<Spinner><p>Attempting to locate your position...</p></Spinner>
{:then { permission, position }}
	<Map
		bind:this={map}
		mode="form"
		sourceName = {key}
		center={useUrlParams || !position ? center : position}
		permissionGranted={permission === 'granted'}
		{features}
		{activeFeature}
		{limit}
		featureAdded={(position) => handleFeatureAdded(position)}
		featureUpdated={(position, featureId) => handleFeatureUpdated(position, featureId)}
		featureRemoved={(featureId) => handleFeatureRemoved(featureId)}
	/>

	<!-- {#if permission !== 'granted'}
		<div class="flex h-8 w-full flex-row items-center justify-around space-x-6 text-center">
			<p class="font-bold text-orange-700">
				{permissionText('Geolocation', permission)} Please update the map manually
			</p>
			{#if permission === 'prompt'}
				<button
					type="button"
					class="cursor-pointer rounded-md px-4 py-2 font-bold text-slate-900 hover:bg-slate-200"
					onclick={() => getPosition(fallback)}>Click to Enable Geolocation</button
				>
			{/if}
		</div>
	{/if} -->
{/await}
