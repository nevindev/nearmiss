<script lang="ts">
	type Props = {
		progress?: number;
		text?: string;
		indeterminate?: boolean;
		complete?: boolean;
	};

	let { progress = 0, text = '--', indeterminate = false, complete = false }: Props = $props();
	let circumference = ((2 * 22) / 7) * 120;
	let offset = $derived(circumference - (progress / 100) * circumference);
</script>

<div>
	<div class="flex items-center justify-center">
		<svg class="h-72 w-72 -rotate-90 transform">
			{#if indeterminate}
				<circle
					cx="145"
					cy="145"
					r="120"
					stroke-width="16"
					fill="transparent"
					class="stroke-gray-300"
				/>
			{/if}

			{#if complete}
				<circle
					cx="145"
					cy="145"
					r="120"
					stroke-width="16"
					fill="transparent"
					stroke-dasharray={circumference}
					stroke-dashoffset={offset}
					class="stroke-green-600"
				/>
			{:else}
				<circle
					cx="145"
					cy="145"
					r="120"
					stroke-width="16"
					fill="transparent"
					stroke-dasharray={circumference}
					stroke-dashoffset={offset}
					class="stroke-red-500 transition-[stroke-dashoffset] duration-500"
				/>
			{/if}
		</svg>
    {#if complete}
    <span class="absolute stroke-green-500 text-green-600 text-[14em]">{text}</span>
    {:else}
    <span class="absolute stroke-black text-black text-4xl">{text}</span>
    {/if}
		
	</div>
</div>
