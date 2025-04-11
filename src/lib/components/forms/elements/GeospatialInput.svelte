<script lang="ts">
	import SimpleMapForm from '../SimpleMapForm.svelte';
	import { page } from '$app/state';
	import { type Feature, type Position } from 'geojson';
	import { permissionText } from '$lib/permissions';
	import { getPosition, positionToFeature } from '$lib/geoutils';
	import { featuresFromURLSearchParams, featureToPositionURLString } from '$lib/geoutils';
	import Spinner from '$lib/components/Spinner.svelte';
	import { onMount } from 'svelte';

	type Props = {
		features?: Feature[];
		limit?: number;
		fallback?: Position;
		required?: boolean;
		useUrlParams?: boolean;
		inputChanged: (invalid: boolean) => void;
		// invalid?: boolean;
	};

	let {
		features = [],
		limit = 1,
		fallback = [-77.357, 38.9586],

		required = false,
		useUrlParams = false,
		inputChanged
	}: Props = $props();

	onMount(() => {
		if (useUrlParams) {
			features = featuresFromURLSearchParams(page.url.searchParams, 'position');
		}
	});

	let activeFeature = $derived(features.at(limit - 1));

	let center = $derived.by(() => {
		return activeFeature && activeFeature.geometry.type === 'Point'
			? activeFeature.geometry.coordinates
			: fallback;
	});

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

	function handleFeatureAdded(position: Position) {
		features = [...features, positionToFeature(position, 0)];
	}

	function handleFeatureUpdated(position: Position, feature: Feature) {
		if (feature.geometry.type === 'Point') {
			feature.geometry.coordinates = position;
			let mutated = $state.snapshot(features);
			mutated.splice(0, 1, feature);
			features = mutated as Feature[];
			// feature.geometry.coordinates = position;
			// features = [feature];
			updateURLSearchParams('position');
		}
	}
</script>

<input class="pointer-events-none invisible h-0" type="numeric" name="lng" value={NaN} required />
<input class="pointer-events-none invisible h-0" type="numeric" name="lat" value={NaN} required />

{#await getPosition(fallback)}
	<SimpleMapForm
		mode="form"
		{center}
		permissionGranted={false}
		bind:features
		{activeFeature}
		{limit}
		featureAdded={(position) => handleFeatureAdded(position)}
		featureUpdated={(position, feature) => handleFeatureUpdated(position, feature)}
	/>
	<Spinner><p>Attempting to locate your position...</p></Spinner>
{:then { permission, position }}
	<SimpleMapForm
		mode="form"
		center={useUrlParams || !position ? center : position}
		permissionGranted={permission === 'granted'}
		bind:features
		{activeFeature}
		{limit}
		featureAdded={(position) => handleFeatureAdded(position)}
		featureUpdated={(position, feature) => handleFeatureUpdated(position, feature)}
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
