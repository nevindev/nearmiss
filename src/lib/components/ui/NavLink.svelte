<script lang="ts">
	import { page } from '$app/state';
	import type { Link } from '$lib/types';

	type Props = {
		link: Link;
	};

	let { link }: Props = $props();
	let active = $derived(page.route.id === link.href);
</script>

<a
	tabindex="0"
	class={`w-48 cursor-pointer rounded-md border border-transparent px-4 py-2 hover:border-slate-950 hover:text-slate-950 ${active ? 'border-b border-slate-600/30 bg-slate-800/20 text-slate-950 backdrop-blur-lg backdrop-filter' : ''}`}
	href={link.href}>{link.title}</a
>
