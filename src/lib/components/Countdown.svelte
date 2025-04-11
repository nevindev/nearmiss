<script lang="ts">
	import { onDestroy } from 'svelte';
	import RadialProgress from './RadialProgress.svelte';

	type Props = {
		time?: number;
		onTimeout: () => void;
	};

	let { time = 5, onTimeout }: Props = $props();
	let countdown = $state<number>(time);
	let stopped = $state(false);
	let counting = $derived(countdown >= 0 && !stopped);

	let interval = setInterval(updateCounter, 1000);

	function restart() {
		countdown = time;
		stopped = false;
	}

	function updateCounter() {
		if (counting) {
			countdown -= 1;

			if (countdown === 0) {
				stopped = true;
				onTimeout();
			}
		}
	}

	onDestroy(() => {
		clearInterval(interval);
	});
</script>

<div class="mx-auto min-h-full max-w-full space-y-6 py-6 text-center sm:px-6 lg:px-8">
	{#if counting}
		<RadialProgress
			progress={(countdown / time) * 100}
			text={`${countdown.toString()} ${countdown == 1 ? 'second' : 'seconds'}`}
		/>
		<button
			class="pointer-events-auto rounded-md px-4 py-2 font-bold text-black hover:bg-slate-200"
			onclick={() => (stopped = true)}>Cancel</button
		>
	{:else}
		<RadialProgress indeterminate={true} />
		<button
			class="pointer-events-auto rounded-md px-4 py-2 font-bold text-black hover:bg-slate-200"
			onclick={restart}>Restart</button
		>
	{/if}
</div>
