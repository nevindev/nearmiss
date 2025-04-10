<script lang="ts">
	import { fly } from 'svelte/transition';
	// import { quadInOut } from 'svelte/easing';
	// import { flip } from 'svelte/animate';

	// const options = { delay: 0, duration: 300, easing: quadInOut };

	type Props = {
		errors: HTMLElement[];
	};

	let { errors }: Props = $props();

	function scrollIntoView(el: HTMLElement) {
		if (!el) return;
		el.scrollIntoView({
			behavior: 'smooth'
		});
	}
</script>

<!-- transition:fly={{ x: -200, duration: 300, delay: 50, easing: quadInOut }}  -->
<!-- animate:flip={options} -->

<button
	type="button"
	class="fixed top-16 z-[999] flex h-8 w-full cursor-pointer items-center justify-center bg-red-500 p-1 text-white"
	onclick={() => scrollIntoView(errors[0])}
>
	Survey contains {errors.length}
	{errors.length > 1 ? 'errors' : 'error'}. Click this banner to navigate to each one.
</button>

<!-- <div class="flex flex-col space-y-4 rounded-md bg-red-500/80 p-6 text-white">
	<p class="font-bold">
		Please answer the following {errors.length > 1 ? 'questions' : 'question'}:
	</p>
	<div class="grid-flow-rows grid grid-cols-1 gap-4 md:grid-cols-2">
		{#each errors as error (error.id)}
			<button
				class="cursor-pointer rounded-md border border-white p-2 hover:bg-red-500"
				type="button"
				onclick={() => scrollIntoView(error)}>{error.getAttribute('data-question')}</button
			>
		{/each}
	</div>
</div> -->
