<script lang="ts">
	type Props = {
		key: string;
		value: any;
	};

	let { key, value }: Props = $props();
	console.log(key, value);
</script>
<div class="flex flex-col space-x-4 justify-start">
{#if typeof value === 'string' && value !== ''}

	<p>{key.toLocaleUpperCase().replaceAll('_', ' ')}:</p>
	<p>{value}</p>
{:else if Array.isArray(value) && value.length !== 0}
	<p>{key.toLocaleUpperCase().replaceAll('_', ' ')}:</p>
  <div class="grid grid-flow-row grid-cols-2 gap-4 md:grid-cols-2">
    {#each value as v}
		<p>{v}</p>
	{/each}
  </div>

{/if}
</div>
