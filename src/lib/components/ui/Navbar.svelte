<script lang="ts">
	import { page } from '$app/state';
	import NavLink from './NavLink.svelte';
	import type { Link } from '$lib/types';

	const links: Link[] = [
		{ href: '/', title: 'Auto Report' },
		{ href: '/map', title: 'Map' },
		{ href: '/reports', title: 'My Reports' }
	];
</script>

<nav
	class="sticky top-0 z-[999] h-16 w-full content-center border-b border-slate-300/40 bg-slate-500/20 backdrop-blur-xl saturate-150 backdrop-filter"
>
	<ul
		class="flex flex-row justify-around text-center text-lg font-medium text-slate-800 select-none"
	>
		{#each links as link}
			<li>
				<NavLink {link}></NavLink>
			</li>
		{/each}
	</ul>
</nav>
