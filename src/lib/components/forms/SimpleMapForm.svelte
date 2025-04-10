<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { blur } from 'svelte/transition';
	import { linear, quadInOut } from 'svelte/easing';
	import type { Point, Position, Feature } from 'geojson';
	import { positionToFeature, positionsToFeatureCollection } from '$lib/geoutils';
	import {
		Map,
		type LngLatLike,
		GeolocateControl,
		NavigationControl,
		type MapLayerMouseEvent,
		GeoJSONSource
	} from 'maplibre-gl';

	import 'maplibre-gl/dist/maplibre-gl.css';
	import type { number } from '$lib/paraglide/registry';

	type Props = {
		center?: Position;
		features?: Feature[];
		limit?: number;
		permissionGranted?: boolean;
		updateCancellable?: boolean;
		zoom?: number;
		sourceName?: string;
		featureRequested: (position: Position, id?: number | string) => void;
		// featureAdded: (feature: Feature) => void;
	};

	let {
		sourceName = 'features',
		center = [0, 0],
		features = $bindable([]),
		limit = 1,
		zoom = 18,
		permissionGranted = false,
		updateCancellable = false,
		// featureAdded,
		featureRequested
	}: Props = $props();

	let moving = $state<boolean>(false);
	let mapLoaded = $state<boolean>(false);
	let style: string = $state<string>(
		'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json'
	);
	let keyboardEnabled = $state<boolean>(true);
	let activeId = $state<number | string>();

	let mapContainer: HTMLElement;
	let geolocate: GeolocateControl;
	let navigation: NavigationControl;
	let map: Map;

	function zoomToDefault() {
		map.zoomTo(18, { duration: 1_500 });
	}

	function updateCenter() {
		const { lng, lat } = map.getCenter();
		center = [lng, lat];
		zoom = map.getZoom();
		moving = false;
	}

	async function addFeature() {
		featureRequested(center, activeId);
	}

	$effect(() => {
		if (mapLoaded) {
			updateFeatures();
		}
	});

	async function updateFeatures() {
		let source: GeoJSONSource | undefined = map.getSource(sourceName);
		if (source !== undefined) {
			source.setData({
				type: 'FeatureCollection',
				features: features
			});
		}
	}

	// async function updateFeature() {
	// 	let source: GeoJSONSource | undefined = map.getSource(sourceName);
	// 	if (source !== undefined) {
	// 		let newFeature = positionToFeature(center, features.length);
	// 		if (activeIndex === -1 && features.length < limit) {
	// 			features = [...features, newFeature];
	// 		} else if (activeIndex >= 0 || features.length == limit) {
	// 			let mutated = $state.snapshot(features);
	// 			mutated.splice(activeIndex, 1, newFeature);
	// 			features = mutated as Feature[];
	// 		}
	// source.setData({
	// 	type: 'FeatureCollection',
	// 	features: features
	// });
	// 		featureAdded(newFeature);
	// 	}
	// }

	onMount(() => {
		map = new Map({
			container: mapContainer,
			style: style,
			center: center as LngLatLike,
			zoom: zoom,
			minZoom: 8,

			maxZoom: 22,
			keyboard: keyboardEnabled
		});

		geolocate = new GeolocateControl({
			positionOptions: {
				enableHighAccuracy: true
			},
			trackUserLocation: false
		});

		navigation = new NavigationControl({
			visualizePitch: true,
			visualizeRoll: true,
			showZoom: true,
			showCompass: true
		});

		map.addControl(navigation, 'bottom-left');
		if (permissionGranted) {
			map.addControl(geolocate, 'bottom-right');
		}

		map.on('movestart', () => (moving = true));
		map.on('moveend', updateCenter);
		map.on('load', async () => {
			let image = await map.loadImage(
				'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/MUTCD_W11-2.svg/240px-MUTCD_W11-2.svg.png'
			);
			map.addImage('walksign', image.data);
			map.addSource(sourceName, {
				type: 'geojson',
				// data: positionsToFeatureCollection(positions ? positions : [])
				data: {
					type: 'FeatureCollection',
					// features: feature ? [feature] : []
					features: features ? features : []
				}
			});

			map.addLayer({
				id: sourceName,
				type: 'symbol',
				source: sourceName,
				layout: {
					'icon-image': '{icon}',
					'icon-size': 0.25
				}
			});
			mapLoaded = true;
		});

		map.on('click', sourceName, (e: MapLayerMouseEvent) => {
			if (e.features) {
				// const index = e.features.indexOf(e.features[0])
				// const id = e.features[0].properties.id as number;
				// console.log(id);
				// const geom = e.features[0].geometry;
				if (e.features[0].geometry.type === 'Point') {
					activeId = e.features[0].properties.id as number;
					// activeIndex = e.features.indexOf(e.features[0]);
					// activeId = id;
					// activeId = e.features[0].properties.id
					// feature = e.features[0];
				}
			}
		});

		map.on('mouseenter', sourceName, () => {
			map.getCanvas().style.cursor = 'pointer';
		});

		map.on('mouseleave', sourceName, () => {
			map.getCanvas().style.cursor = '';
		});
	});

	onDestroy(() => {
		map.remove();
		mapLoaded = false;
	});
</script>

<div
	class="relative z-40 h-full w-full"
	bind:this={mapContainer}
	in:blur={{ duration: 50, easing: linear }}
>
	<svg
		viewBox="0 0 200 100"
		xmlns="http://www.w3.org/2000/svg"
		class={`"pointer-events-none absolute top-1/2 left-1/2 z-50 h-4 w-4 ${moving ? 'scale-90 fill-black/20' : 'fill-black/30'} -translate-x-1/2 -translate-y-[50%]  transition duration-150 ease-in-out`}
	>
		<ellipse cx="100" cy="50" rx="100" ry="50" />
	</svg>
	<svg
		class={`"pointer-events-none absolute top-1/2 left-1/2 z-50 h-10 w-10 -translate-x-1/2 fill-red-600 transition duration-150 ease-in-out ${moving ? '-translate-y-[120%]' : '-translate-y-[100%]'}`}
		viewBox="0 0 64 146.28381"
		xmlns="http://www.w3.org/2000/svg"
	>
		<path
			d="M 64,32 C 64,14.33016 49.668641,0 32,0 14.329551,0 0,14.33016 0,32 0,48.10635 11.941795,61.30292 27.427836,63.53451 v 82.74931 h 9.143116 V 63.53451 C 52.052481,61.30292 64,48.10635 64,32 Z"
		/>
	</svg>

	<div class="absolute bottom-12 left-1/2 z-60 -translate-x-1/2">
		{#if mapLoaded}
			{#if (activeId !== undefined || features.length === limit) && zoom >= 15}
				{#if updateCancellable}
					<div class="inline-flex">
						<button
							type="button"
							class="rounded-l-md bg-blue-500 px-4 py-2 text-base font-bold font-medium text-white hover:bg-blue-600"
							onclick={addFeature}
						>
							Update Location
						</button>
						<button
							type="button"
							class="rounded-r-md bg-gray-300 px-4 py-2 text-base font-bold font-medium text-gray-800 hover:bg-gray-400"
							onclick={() => (activeId = undefined)}
						>
							Cancel
						</button>
					</div>
				{:else}
					<button
						type="button"
						class="rounded-md bg-blue-500 px-4 py-2 text-base font-bold font-medium text-white hover:bg-blue-600"
						onclick={addFeature}
					>
						Update Location
					</button>
				{/if}
			{:else if activeId === undefined && features.length < limit && zoom >= 15}
				<button
					type="button"
					class="cursor-pointer rounded-md bg-red-500 p-2 text-base font-medium text-white hover:bg-red-700 disabled:bg-slate-300/40"
					onclick={addFeature}
					disabled={moving}>Add New Report</button
				>
			{:else}
				<button
					type="button"
					class="cursor-pointer rounded-md bg-slate-500 p-2 text-base font-medium text-white hover:bg-slate-700 disabled:bg-slate-300/40"
					onclick={zoomToDefault}>Click to zoom in</button
				>
			{/if}
		{:else}
			<p class="text-lg font-medium text-slate-900">Loading Map...</p>
		{/if}
	</div>
</div>
