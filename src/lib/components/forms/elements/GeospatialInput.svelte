<script lang="ts">
	import SimpleMapForm from '../SimpleMapForm.svelte';
	import { page } from '$app/state';
	import { type Feature, type Position } from 'geojson';
	import { permissionText } from '$lib/permissions';
	import { getPosition } from '$lib/geoutils';
	import {
		// featureToPosition,
		// featureFromURLSearchParams,
		// positionsFromURLSearchParams,
		featuresFromURLSearchParams
	} from '$lib/geoutils';
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
			features = featuresFromURLSearchParams(page.url.searchParams);
		}
	});

	let center = $derived.by(() => {
		let feature = features.at(limit - 1);
		return feature && feature.geometry.type === 'Point' ? feature.geometry.coordinates : fallback;
	});

	// let features = $state<Feature[]>(featuresFromURLSearchParams(page.url.searchParams));
	// let feature = $state<Feature | undefined>(featureFromURLSearchParams(page.url.searchParams));
	// let featurePosition = $derived<Position>(featureToPosition(feature));
	// let lng = $derived(Number.isNaN(featurePosition[0]) ? '' : featurePosition[0]);
	// let lat = $derived(Number.isNaN(featurePosition[1]) ? '' : featurePosition[1]);
	// let invalid = $derived(Number.isNaN(lng) || Number.isNaN(lat));
	// let invalid = $derived.by(() =>
	// 	positions.every((position) => Number.isNaN(position[0]) || Number.isNaN(position[1]))
	// );

	let invalid = $derived.by(() => features.every((feature) => invalidFeature(feature)));

	function invalidFeature(feature: Feature) {
		return (
			feature.geometry.type !== 'Point' ||
			feature.properties?.id === null ||
			Number.isNaN(feature.geometry.coordinates[0]) ||
			Number.isNaN(feature.geometry.coordinates[1])
		);
	}

  function handleFeatureRequested(position: Position, id?: number|string) {
    console.log(position)
  }



	// $effect(() => console.log(positions.every(position => !Number.isNaN(position[0]) || !Number.isNaN(position[1]))));
	// function handleChange(feature: Feature) {
		// if (validFeature(feature)) {
		// inputChanged(invalidFeature(feature));

		//   console.log(feature)
		// }
		// 	features
		// 		.filter((feature) => invalidFeature(feature))
		// 		.forEach((feature) =>
		// 			page.url.searchParams.append(
		// 				feature.id.toString(),
		// 				`${feature.geometry.coordinates[0]},${position[1]}`
		// 			)
		// 		);
		// 	// features.forEach((feature) =>
		// 	// 	page.url.searchParams.append(
		// 	// 		feature.id.toString(),
		// 	// 		`${feature.geometry.coordinates[0]},${position[1]}`
		// 	// 	)
		// 	// );
		// 	// 	page.url.searchParams.set('lng', lng.toString());
		// 	// 	page.url.searchParams.set('lat', lat.toString());
		// 	window.history.pushState({}, '', '?' + $state.snapshot(page.url.searchParams.toString()));
		// 	// inputChanged(invalid);
		// }
	// }
</script>

<input class="pointer-events-none invisible h-0" type="numeric" name="lng" value={NaN} required />
<input class="pointer-events-none invisible h-0" type="numeric" name="lat" value={NaN} required />

{#await getPosition(fallback)}
	<SimpleMapForm
		{center}
		permissionGranted={false}
		bind:features
		{limit}
		featureRequested={(position, id) => handleFeatureRequested(position, id)}
	/>
	<Spinner><p>Attempting to locate your position...</p></Spinner>
{:then { permission, position }}
	<SimpleMapForm
		center={position ? position : center}
		permissionGranted={permission === 'granted'}
		bind:features
		{limit}
    featureRequested={(position, id) => handleFeatureRequested(position, id)}

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
