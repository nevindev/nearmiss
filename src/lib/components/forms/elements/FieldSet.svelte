<script lang="ts">
	import type { Question } from '$lib/types';
	import CheckboxInput from './CheckboxInput.svelte';
	import RadioInput from './RadioInput.svelte';
	import TextAreaInput from './TextAreaInput.svelte';
	import GeospatialInput from './GeospatialInput.svelte';
	import DateTimeInput from './DateTimeInput.svelte';

	type Props = {
		question: Question;
		showErrors?: boolean;
		disabled?: boolean;
		errors: HTMLElement[];
	};

	let ref = $state<HTMLElement>();
	let { question, showErrors = false, disabled = false, errors = $bindable()}: Props = $props();
	let hasInvalid = $state(false);

	function onInputChanged(invalid: boolean) {
		if (ref) {
			if (invalid && !errors.includes(ref)) {
				hasInvalid = true;
				errors = [...errors, ref];
			} else {
				hasInvalid = false;
				errors = errors.filter((el) => el.id !== question.key);
			}
		}
	}
</script>

<section
	bind:this={ref}
	id={question.key}
	class={`"transition-all snap-start scroll-mt-30 duration-200 ease-in-out ${showErrors ? 'has-invalid:bg-red-400/10' : ''}`}
>
	<fieldset
		class="block space-y-2 p-4"
	>
		<legend class="text-lg font-medium">
			{question.legend}
			<span class="text-md font-bold text-red-600">{question.required ? '*' : ''}</span>
		</legend>
		{#each question.description as d}
			<p class="text-sm font-normal">{d}</p>
		{/each}
		{#if question.type === 'checkbox'}
			<CheckboxInput
				key={question.key}
				choices={question.choices}
				required={question.required}
				{disabled}
				inputChanged={onInputChanged}
			/>
		{:else if question.type === 'radio'}
			<RadioInput
				key={question.key}
				choices={question.choices}
				required={question.required}
				{disabled}
				inputChanged={onInputChanged}
			/>
		{:else if question.type === 'textarea'}
			<TextAreaInput key={question.key} required={question.required} {disabled} />
		{:else if question.type === 'date'}
			<DateTimeInput key={question.key} required={question.required} {disabled} useUrlParams={true} inputChanged={onInputChanged} />
		{:else if question.type === 'geospatial'}
			<div class="relative flex h-[600px] w-full flex-col items-center">
				<GeospatialInput key={question.key} required={true} {disabled} useUrlParams={true} inputChanged={onInputChanged} limit={1} />
			</div>
		{/if}
		{#if showErrors && hasInvalid}
			<p class="text-sm font-medium text-red-500">This is a required question</p>
		{/if}
	</fieldset>
</section>
