<script lang="ts">
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

<button
	type="button"
	class="fixed top-16 z-[999] flex min-h-fit w-full cursor-pointer items-center justify-center bg-red-500 p-1 text-white"
	onclick={() => scrollIntoView(errors[0])}
>
	Survey contains {errors.length}
	{errors.length > 1 ? 'errors' : 'error'}. Click this banner to navigate to each one.
</button>
