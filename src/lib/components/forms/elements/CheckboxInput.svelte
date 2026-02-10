<script lang="ts">
	import { page } from '$app/state';

	type Props = {
		key: string;
		choices?: string[];
		required?: boolean;
		disabled?: boolean;
		inputChanged: (invalid: boolean) => void;
	};

	let { key, choices, required = false, disabled=false, inputChanged }: Props = $props();

	let group = $state(page.url.searchParams.getAll(key));
	let invalid = $derived(required && group.length === 0);

	function handleChange() {
		if (group) {
			page.url.searchParams.delete(key);
			group.forEach((entry) => page.url.searchParams.append(key, entry));
			window.history.pushState({}, '', '?' + $state.snapshot(page.url.searchParams.toString()));
			inputChanged(invalid);
		}
	}
</script>

{#if choices}
	<div class="grid grid-flow-row grid-cols-1 gap-4 md:grid-cols-2">
		{#each choices as choice}
			<label
				class="flex enabled:cursor-pointer disabled:cursor-not-allowed flex-row-reverse items-center justify-end rounded-sm border border-slate-600 p-4 enabled:hover:bg-green-500/20 has-checked:bg-green-500/30 enabled:has-focus:ring-4 enabled:has-focus:ring-green-500/30"
			>
				{choice}
				<input
					class="mr-4 h-6 w-6 text-green-500 enabled:hover:bg-green-500/10 enabled:hover:ring-3 enabled:hover:ring-green-500/90 enabled:hover:checked:bg-green-500 invalid:bg-red-100/10"
					name={key}
					{disabled}
					type="checkbox"
					value={choice}
					bind:group
					required={invalid}
					aria-required={invalid}
					onchange={handleChange}
				/>
			</label>
		{/each}
	</div>
{/if}
