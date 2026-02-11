<script lang="ts">
	type Props = {
		lifted: boolean;
		hasFocus: boolean;
	};
	let { lifted = false, hasFocus = false }: Props = $props();
</script>

<svg
	viewBox="0 0 200 100"
	xmlns="http://www.w3.org/2000/svg"
	class={`"pointer-events-none absolute top-1/2 left-1/2 z-50 h-4 w-4 ${lifted ? 'scale-90 fill-black/20' : 'fill-black/30'} -translate-x-1/2 -translate-y-[50%]  transition duration-150 ease-in-out`}
>
	<ellipse cx="100" cy="50" rx="100" ry="50" />
</svg>
<svg
	class={`"pointer-events-none absolute top-1/2 left-1/2 z-50 h-10 w-10 -translate-x-1/2 fill-red-600 transition duration-150 ease-in-out ${lifted || hasFocus ? '-translate-y-[120%]' : '-translate-y-[100%]'}`}
	viewBox="0 0 64 146.28381"
	xmlns="http://www.w3.org/2000/svg"
>
	<path
		d="M 64,32 C 64,14.33016 49.668641,0 32,0 14.329551,0 0,14.33016 0,32 0,48.10635 11.941795,61.30292 27.427836,63.53451 v 82.74931 h 9.143116 V 63.53451 C 52.052481,61.30292 64,48.10635 64,32 Z"
	/>
</svg>
