<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { blur, fade, slide } from 'svelte/transition';
	import { linear, quadInOut } from 'svelte/easing';
	import type { Position, Feature } from 'geojson';
	import { goto } from '$app/navigation';
	import {
		GeoJSONSource,
		Map,
		type GeoJSONFeatureDiff,
		type GeoJSONSourceDiff,
		type GeoJSONFeatureId,
		type LngLatLike,
		GeolocateControl,
		NavigationControl,
		FullscreenControl,
		type MapLayerMouseEvent
	} from 'maplibre-gl';

	import 'maplibre-gl/dist/maplibre-gl.css';
	import { positionToPoint, updateProperty, fallback, pbotBase64 } from '$lib/geoutils';
	import ReportPopup from '../reports/ReportPopup.svelte';
	import MapPin from './MapPin.svelte';
	import { PulsingDot } from './PulsingDot';

	type Props = {
		sourceName?: string;
		features?: Feature[];
		activeFeature?: Feature;
		limit?: number;
		permissionGranted?: boolean;
		mode?: 'map' | 'form';
		zoom?: number;
		minZoom?: number;
		maxZoom?: number;
		center?: Position;
		flyTo?: Position;
		featureAdded: (position: Position) => void;
		featureUpdated: (position: Position, featureId: GeoJSONFeatureId) => void;
		featureRemoved?: (featureId: GeoJSONFeatureId) => void;
	};

	let {
		sourceName = 'feature',
		features = $bindable([]),
		activeFeature,
		limit = Infinity,
		permissionGranted = false,
		mode = 'map',
		zoom = 18,
		minZoom = 8,
		maxZoom = 22,
		center = fallback,
		flyTo,
		featureAdded,
		featureUpdated,
		featureRemoved
	}: Props = $props();

	let moving = $state<boolean>(false);
	let mapLoaded = $state<boolean>(false);
	let style: string = $state<string>(
		'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json'
	);
	let keyboardEnabled = $state<boolean>(true);
	let activeId: GeoJSONFeatureId | undefined = $derived(
		activeFeature?.id && activeFeature.id !== undefined ? activeFeature.id : undefined
	);
	let activePosition: Position | undefined = $derived(
		activeFeature?.geometry.type === 'Point' ? activeFeature.geometry.coordinates : undefined
	);

	let needToZoom: boolean = $derived(zoom <= maxZoom - minZoom);

	let mapContainer: HTMLDivElement;
	let geolocate: GeolocateControl;
	let navigation: NavigationControl;
	let map: Map;

	$effect(() => {
		if (mode === 'map') {
			goto(activeId === undefined ? '/map' : `/map?selected=${activeId}`);
		}
	});

	// Public functions exposed for use by other pages, i.e. map.<function>
	export async function addFeature(sourceName: string, feature: Feature) {
		let source: GeoJSONSource | undefined = map.getSource(sourceName);
		if (source != undefined) {
			source.updateData({ add: [feature] });
			features = [...features, feature];
		}
	}

	export async function updateFeature(sourceName: string, featureDiffs: GeoJSONFeatureDiff[]) {
		let source: GeoJSONSource | undefined = map.getSource(sourceName);
		if (source != undefined) {
			source.updateData({ update: featureDiffs });
		}
	}

	export async function updateData(sourceName: string, diff: GeoJSONSourceDiff) {
		let source: GeoJSONSource | undefined = map.getSource(sourceName);
		if (source != undefined) {
			source.updateData(diff);
		}
	}

	export async function removeFeature(sourceName: string, id: GeoJSONFeatureId) {
		let source: GeoJSONSource | undefined = map.getSource(sourceName);
		if (source != undefined) {
			source.updateData({ remove: [id] });
			features = features.filter((feature) => feature.id !== id);
			activeFeature = undefined;
		}
	}

	export function setFeatureActive(feature?: Feature) {
		if (feature && feature.id !== undefined && feature.geometry.type === 'Point') {
			flyTo = feature.geometry.coordinates;
			zoomToDefault();
			let featureDiffs: GeoJSONFeatureDiff[] = [
				{
					id: feature.id,
					newGeometry: positionToPoint(feature.geometry.coordinates),
					addOrUpdateProperties: updateProperty(true)
				},
				{
					id: activeId ? activeId : -1,
					addOrUpdateProperties: updateProperty(false)
				}
			];
			updateFeature(sourceName, featureDiffs);
			activeFeature = feature;
		}
	}

	// Functions used locally by buttons
	function zoomToDefault() {
		if (flyTo !== undefined) {
			map.flyTo({
				center: flyTo as LngLatLike,
				zoom: 18,
				speed: 0.75,
				curve: 1.5
			});
		} else {
			map.zoomTo(18, { duration: 1_500 });
		}
	}

	function updateCenter() {
		const { lng, lat } = map.getCenter();
		center = [lng, lat];
		zoom = map.getZoom();
		moving = false;
	}

	function add() {
		featureAdded(center);
		flyTo = center;
	}

	function update() {
		if (activeId !== undefined) {
			featureUpdated(center, activeId);
			flyTo = center;
		}
	}

	function remove() {
		if (activeId !== undefined && featureRemoved !== undefined) {
			featureRemoved(activeId);
			flyTo = undefined;
		}
	}

	function clear() {
		if (activeId !== undefined && activePosition !== undefined) {
			let featureDiff: GeoJSONFeatureDiff = {
				id: activeId,
				addOrUpdateProperties: updateProperty(false)
			};
			updateFeature(sourceName, [featureDiff]);
			activeFeature = undefined;
			flyTo = undefined;
		}
	}

	function nextFeature(direction: number) {
		if (activeId !== undefined) {
			let index = features.findIndex((feature) => feature.id === activeId);
			let next = (index + direction) % features.length;
			setFeatureActive(features.at(next));
		}
	}

	onMount(() => {
		map = new Map({
			container: mapContainer,
			style: style,
			center: activePosition ? (activePosition as LngLatLike) : (center as LngLatLike),
			zoom: zoom,
			minZoom: minZoom,
			maxZoom: maxZoom,
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

		map.addControl(new FullscreenControl(), mode === 'map' ? 'bottom-right' : 'top-right');

		map.on('movestart', () => (moving = true));
		map.on('moveend', updateCenter);
		map.on('load', async () => {
			let defaultIcon = await map.loadImage(pbotBase64);
			let activeIcon = new PulsingDot(map);

			map.addImage('default', defaultIcon.data);
			map.addImage('active', activeIcon, { pixelRatio: 2 });

			map.addSource(sourceName, {
				type: 'geojson',
				data: {
					type: 'FeatureCollection',
					features: features ? features : []
				}
			});

			if (activeFeature && activePosition && activeId) {
				flyTo = activePosition;
				updateFeature(sourceName, [
					{
						id: activeId,
						newGeometry: positionToPoint(activePosition),
						addOrUpdateProperties: updateProperty(true)
					}
				]);
			}

			map.addLayer({
				id: sourceName,
				type: 'symbol',
				source: sourceName,
				layout: {
					'icon-image': '{icon}',
					'icon-size': ['get', 'iconSize'],
					'symbol-sort-key': ['get', 'priority']
				}
			});

			mapLoaded = true;
		});

		map.on('click', sourceName, (e: MapLayerMouseEvent) => {
			if (e.features) {
				setFeatureActive(e.features[0]);
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
	<MapPin lifted={moving} />

	{#if mapLoaded}
		{#if activeFeature === undefined && features.length < limit && !needToZoom}
			<button
				transition:fade={{ delay: 50, duration: 100 }}
				type="button"
				class="absolute bottom-20 left-1/2 z-50 -translate-x-1/2 cursor-pointer rounded-md bg-red-500 p-2 text-base font-medium text-white shadow-md select-none hover:bg-red-700 disabled:bg-slate-300/40"
				onclick={add}
				disabled={moving}>Add New {sourceName}</button
			>
		{:else if activeFeature === undefined && needToZoom}
			<button
				type="button"
				class="absolute bottom-20 left-1/2 z-50 -translate-x-1/2 cursor-pointer rounded-md bg-slate-500 p-2 text-base font-medium text-white shadow-md select-none hover:bg-slate-700"
				onclick={zoomToDefault}
			>
				Zoom in</button
			>
		{:else if activeFeature !== undefined}
			<div
				transition:slide={{ delay: 50, duration: 150, easing: linear, axis: 'y' }}
				class="absolute bottom-10 left-1/2 z-50 flex -translate-x-1/2 flex-row items-center space-x-6"
			>
				{#if features.length > 1}
					<button
						type="button"
						aria-label="previous feature"
						class="flex aspect-square w-12 cursor-pointer items-center justify-center rounded-full border border-slate-300/40 bg-slate-500/20 text-center shadow-sm saturate-150 backdrop-blur-xl backdrop-filter select-none"
						onclick={() => nextFeature(-1)}
						><svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="mr-1 h-6 w-6"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M15.75 19.5 8.25 12l7.5-7.5"
							/>
						</svg>
					</button>
				{/if}
				{#if mode === 'map'}
					<ReportPopup
						feature={activeFeature}
						{update}
						{remove}
						zoom={zoomToDefault}
						close={clear}
					/>
				{:else if mode === 'form'}
					<div
						transition:slide={{ delay: 50, duration: 150, easing: quadInOut, axis: 'y' }}
						class="flex min-w-xs flex-col items-center justify-center space-y-3 rounded-md border border-slate-300/40 bg-slate-500/20 p-4 shadow-sm saturate-150 backdrop-blur-xl backdrop-filter select-none"
					>
						<p class="text-center text-lg font-bold">
							Location {activeId}
						</p>
						<!-- <p class="font-mono">{feature.properties?.date}</p> -->
						<button
							type="button"
							class="-py-4 text-center text-xs font-bold text-slate-900 hover:text-blue-600"
							onclick={zoomToDefault}>Zoom to Location</button
						>
						<div
							class="align-center inline-flex w-full items-center text-center text-sm text-wrap text-white"
						>
							<button
								type="button"
								class="h-12 w-1/2 cursor-pointer rounded-l-md bg-blue-500 p-1 shadow-md hover:bg-blue-600"
								onclick={update}
							>
								Update {sourceName}
							</button>
							<button
								type="button"
								class="h-12 w-1/2 cursor-pointer rounded-r-md bg-red-500 p-1 shadow-md hover:bg-red-600"
								onclick={remove}
							>
								Delete
							</button>
						</div>
						<button
							type="button"
							class="flex-1 text-sm font-bold text-gray-600 hover:text-red-500"
							onclick={clear}>Close</button
						>
					</div>
				{/if}
				{#if features.length > 1}
					<button
						type="button"
						aria-label="next feature"
						class="flex aspect-square w-12 cursor-pointer items-center justify-center rounded-full border border-slate-300/40 bg-slate-500/20 text-center shadow-sm saturate-150 backdrop-blur-xl backdrop-filter select-none"
						onclick={() => nextFeature(1)}
						><svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="ml-1 h-6 w-6"
						>
							<path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
						</svg>
					</button>
				{/if}
			</div>
		{/if}
	{:else}
		<p class="text-lg font-medium text-slate-900">Loading Map...</p>
	{/if}
</div>
