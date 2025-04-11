<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { Point, Position } from 'geojson';
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

	onMount(() => {
		map = new Map({
			container: mapContainer,
			style: style,
			center: position as LngLatLike,
			zoom: zoom,
			dragPan: interactive,
			attributionControl: false
		});

		new Marker({ color: '#FFF000' }).setLngLat(position as LngLatLike).addTo(map);
	});

	onDestroy(() => {
		map.remove();
	});
</script>

<div class="pointer-events-none h-full w-full rounded-lg" bind:this={mapContainer}></div>
