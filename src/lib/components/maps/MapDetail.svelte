<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { Position } from 'geojson';
	import { pbotBase64 } from '$lib/geoutils';
	import { Map, type LngLatLike, Marker } from 'maplibre-gl';

	import 'maplibre-gl/dist/maplibre-gl.css';

	type Props = {
		position: Position;
		interactive?: boolean;
		zoom?: number;
		attribution?: boolean;
	};

	let { position, attribution = false, interactive = false, zoom = 15 }: Props = $props();

	let style: string = $state('https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json');

	let mapContainer: HTMLElement;

	let map: Map;

	function createMarker(): HTMLDivElement {
		const el = document.createElement('div');
		el.className = `h-12 w-12 bg-center bg-contain`;
		el.style.backgroundImage = `url(${pbotBase64})`;
		return el;
	}

	onMount(() => {
		map = new Map({
			container: mapContainer,
			style: style,
			center: position as LngLatLike,
			zoom: zoom,
			dragPan: interactive,
			attributionControl: false
		});

		const canvas = map.getCanvas();
		if (!interactive) {
			map.dragPan.disable();
			map.keyboard.disable();
			map.boxZoom.disable();
			map.doubleClickZoom.disable();
			canvas.tabIndex = 0;
		}

		new Marker({ element: createMarker() }).setLngLat(position as LngLatLike).addTo(map);
	});

	onDestroy(() => {
		map.remove();
	});
</script>

<div class="pointer-events-none h-full w-full rounded-lg" bind:this={mapContainer}></div>
