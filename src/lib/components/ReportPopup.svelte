<script lang="ts">
	import { slide } from 'svelte/transition';
	import { quadInOut } from 'svelte/easing';
	import type { Feature } from 'geojson';

	type Props = {
		feature: Feature;
		update: () => void;
		remove: () => void;
		close: () => void;
	};

	let { feature, update, remove, close }: Props = $props();
</script>

<div
	transition:slide={{ delay: 50, duration: 150, easing: quadInOut, axis: 'y' }}
	class="absolute bottom-20 left-1/2 z-50 flex flex min-w-xs px-4 -translate-x-1/2 flex-col items-center justify-center space-y-4 rounded-md bg-white py-4 shadow-sm"
>
	<p class="text-center text-lg font-bold">
		{feature.properties?.description} Incident
	</p>
	<p class="font-mono">on {feature.properties?.date}</p>
	{#if !feature.properties?.submitted}
		<div class="align-center inline-flex items-center text-center text-sm w-full text-white text-wrap">
			<button
				type="button"
				class="h-16 w-1/3 cursor-pointer rounded-l-md bg-blue-500 p-2 shadow-md hover:bg-blue-600"
				onclick={update}
			>
				Update Location
			</button>
			<a
				href="/reports/{feature.properties?.id}"
				class="h-16 w-1/3 bg-green-600 p-2 leading-12 shadow-md hover:bg-green-700">Take Survey</a
			>
			<button
				type="button"
				class="h-16 w-1/3 cursor-pointer rounded-r-md bg-red-500 p-2 shadow-md hover:bg-red-600"
				onclick={remove}
			>
				Delete Report
			</button>
		</div>
	{/if}
	<button class="flex-1 text-sm font-bold text-gray-600 hover:text-red-500" onclick={close}
		>Close</button
	>
</div>
