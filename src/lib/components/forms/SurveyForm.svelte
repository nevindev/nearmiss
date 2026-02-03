<script lang="ts">
	import { uniqueBy } from '$lib/utils';
	import type { Survey } from '$lib/types';
	import FormReset from './elements/FormReset.svelte';
	import ErrorFields from './elements/ErrorFields.svelte';
	import FieldSet from './elements/FieldSet.svelte';
	import PageProgress from './elements/PageProgress.svelte';

	type Props = {
		survey: Survey;
		currentPage?: number;
		onFormSubmit: (formData: FormData) => void;
	};

	let { survey, currentPage = 1, onFormSubmit }: Props = $props();
	let pageScroll = $state<number>(0);
	let errors = $state<HTMLElement[]>([]);

	let totalPages = $derived(survey.pages.length);
	let showErrors = $derived(errors.length > 0);

	let formData = new FormData();

	// function formDataToUrlSearchParams(formData: FormData): URLSearchParams {
	// 	const params = new URLSearchParams();
	// 	for (const [key, value] of formData.entries()) {
	// 		params.append(key, value as string);
	// 	}
	// 	return params;
	// }

	// function surveyToFormData(survey: URLSearchParams): FormData {
	//   const formData = new FormData();
	//   params.forEach((value, key) => {
	//     formData.append(key, value);
	//   });
	//   return formData;
	// }

	// function urlSearchParamsToFormData(params: URLSearchParams): FormData {
	// 	const formData = new FormData();
	// 	params.forEach((value, key) => {
	// 		formData.append(key, value);
	// 	});
	// 	return formData;
	// }

	function invalidElements(form: HTMLFormElement): HTMLElement[] {
		if (form === undefined) {
			return [];
		} else {
			const invalid: HTMLElement[] = Array.from(form.elements)
				.filter((el: any) => el instanceof HTMLInputElement && !el.validity.valid)
				.map((el) => el.closest('section'))
				.filter((section) => section !== null);
			return uniqueBy(invalid, 'id');
		}
	}

	function updateFormData(form: HTMLFormElement): void {
		const data = new FormData(form);
		for (const [key, value] of data.entries()) {
			formData.append(key, value);
		}
	}

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		const form = event.target as HTMLFormElement;
		errors = invalidElements(form);
		if (showErrors) {
			pageScroll = 0;
		} else if (currentPage < totalPages) {
			updateFormData(form);
			pageScroll = 0;
			currentPage += 1;
		} else {
			updateFormData(form);
			onFormSubmit(formData);
		}
	}
</script>

<svelte:window bind:scrollY={pageScroll} />
{#if showErrors}
	<ErrorFields {errors} />
{:else}
	<FormReset
		onReset={() => {
			pageScroll = 0;
			currentPage = 1;
		}}
	/>
{/if}

<form
	id="survey-form"
	autocomplete="off"
	novalidate
	onsubmit={handleSubmit}
	name="survey-form"
	class="mt-8 grid w-full grid-cols-1 gap-6 pb-6"
>
	<h2 class="bg-yellow-500 py-4 text-center text-xl font-black text-white md:text-2xl">
		{survey.title}
	</h2>
	<div class="flex w-full flex-col px-6 lg:mx-auto lg:max-w-4xl lg:justify-center">
		{#each survey.pages as sp, index}
			{#if currentPage === index + 1}
				<h3 class="text-center text-xl font-bold">{sp.title}</h3>
				{#if sp.description}
					<p class="space-y-4 text-center text-lg font-medium">{@html sp.description}</p>
				{/if}
				{#if sp.questions}
					<div class="snap-y space-y-12">
						{#each sp.questions as question, index}
							<FieldSet {question} {showErrors} bind:errors />
						{/each}
					</div>
				{/if}
			{/if}
		{/each}
		<menu class="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-x-12">
			<div class="flex w-full flex-row items-center space-x-4">
				{#if currentPage > 1}
					<button
						onclick={() => (currentPage -= 1)}
						type="button"
						class="w-full cursor-pointer rounded-sm border border-green-600 px-4 py-2.5 text-green-600 hover:ring-2 hover:ring-green-600/30 md:w-24"
						>Back</button
					>
				{/if}

				{#if currentPage === totalPages}
					<button
						type="submit"
						class="w-full cursor-pointer rounded-sm border border-green-600 bg-green-600 px-4 py-2.5 text-white hover:ring-2 hover:ring-green-600/30 md:w-24"
						>Submit</button
					>
				{:else}
					<button
						type="submit"
						class="w-full cursor-pointer rounded-sm border border-green-600 px-4 py-2.5 text-green-600 hover:ring-2 hover:ring-green-600/30 md:w-24"
						>Next</button
					>
				{/if}
			</div>
			<PageProgress item={'Page'} max={totalPages} value={currentPage} />
		</menu>
	</div>
</form>
