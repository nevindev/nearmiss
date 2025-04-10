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
	class={`w-48 cursor-pointer border border-transparent rounded-md px-4 py-2 hover:text-slate-950 hover:border-slate-950 ${active ? 'border-b border-slate-600/30 bg-slate-800/20 backdrop-blur-sm backdrop-filter text-slate-950' : ''}`}
	href={link.href}>{link.title}</a
>
