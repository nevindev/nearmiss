<script lang="ts">
	import { slide } from 'svelte/transition';
	import { quadInOut } from 'svelte/easing';
	import type { Feature } from 'geojson';
	
	type Props = {
		feature: Feature;
		update: () => void;
		remove: () => void;
		zoom: () => void;
		close: () => void;
	};

	let { feature, update, remove, zoom, close }: Props = $props();
</script>

<div
	transition:slide={{ delay: 50, duration: 150, easing: quadInOut, axis: 'y' }}
	class="flex min-w-xs flex-col items-center justify-center space-y-3 rounded-md border border-slate-300/40 bg-slate-500/20 p-4 shadow-sm saturate-150 backdrop-blur-xl backdrop-filter select-none"
>
	<p class="text-center text-lg font-bold">
		{feature.properties?.description} Incident {feature.id}
	</p>
	<p class="font-mono">{feature.properties?.date}</p>
	<button
		type="button"
		class="-py-4 text-center text-xs font-bold text-slate-900 hover:text-blue-600"
		onclick={zoom}>Zoom to Location</button
	>
	{#if !feature.properties?.submitted}
		<div
			class="align-center inline-flex w-full items-center text-center text-sm text-wrap text-white"
		>
			<button
				type="button"
				class="h-16 w-1/3 cursor-pointer rounded-l-md bg-blue-500 p-2 shadow-md hover:bg-blue-600"
				onclick={update}
			>
				Update Location
			</button>
			<a
				href="/reports/{feature.id}"
				class="h-16 w-1/3 bg-green-600 p-2 leading-12 shadow-md hover:bg-green-700">Take Survey</a
			>
			<button
				type="button"
				class="h-16 w-1/3 cursor-pointer rounded-r-md bg-red-500 p-2 shadow-md hover:bg-red-600"
				onclick={remove}
			>
				Delete
			</button>
		</div>
	{/if}
	<button
		type="button"
		class="flex-1 text-sm font-bold text-gray-600 hover:text-red-500"
		onclick={close}>Close</button
	>
</div>
