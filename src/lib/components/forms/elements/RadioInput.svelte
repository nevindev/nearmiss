<script lang="ts">
	import { page } from '$app/state';
	type Props = {
		key: string;
		choices?: string[];
		required?: boolean;
		invalid?: boolean;
		inputChanged: (invalid: boolean) => void;
	};

	let { key, choices, required = false, inputChanged }: Props = $props();
	let group = $state(page.url.searchParams.get(key));
	let invalid = $derived(required && group === null);

	function handleChange() {
		if (group) {
			page.url.searchParams.set(key, group.toString());
			window.history.pushState({}, '', '?' + $state.snapshot(page.url.searchParams.toString()));
			inputChanged(invalid);
		}
	}
</script>

{#if choices}
	<div class="grid grid-flow-row grid-cols-1 gap-4 md:grid-cols-2">
		{#each choices as choice}
			<label
				class="flex cursor-pointer flex-row-reverse items-center justify-end rounded-sm border border-slate-600 p-4 hover:bg-green-500/20 has-checked:bg-green-500/30 has-focus:ring-4 has-focus:ring-green-500/30"
			>
				{choice}
				<input
					class="mr-4 h-6 w-6 text-green-500 hover:bg-green-500/10 hover:ring-3 hover:ring-green-500/90 hover:checked:bg-green-500"
					type="radio"
					name={`${key}-${choice}`}
					value={choice}
					bind:group
					required={invalid}
					onchange={handleChange}
				/>
			</label>
		{/each}
	</div>
{/if}
