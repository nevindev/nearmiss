<script lang="ts">
	import { uniqueBy } from '$lib/utils';
	import type { Survey, Report } from '$lib/types';
	import ErrorFields from './elements/ErrorFields.svelte';
	import FieldSet from './elements/FieldSet.svelte';
	import PageProgress from './elements/PageProgress.svelte';

	type Props = {
		survey: Survey;
		currentPage?: number;
	};

	let { survey, currentPage = 1 }: Props = $props();
	let pageScroll = $state<number>(0);
	let errors = $state<HTMLElement[]>([]);
	let totalPages = $derived(survey.pages.length);
	let showErrors = $derived(errors.length > 0);

	function invalidElements(form: HTMLFormElement): HTMLElement[] {
		if (form === undefined) {
			return [];
		} else {
			const invalid: HTMLElement[] = Array.from(form.elements)
				.filter((el: any) => el instanceof HTMLInputElement && !el.validity.valid)
				.map((el) => el.closest('fieldset'))
				.filter((fieldset) => fieldset !== null);
			return uniqueBy(invalid, 'id');
		}
	}

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

	function urlSearchParamsToFormData(params: URLSearchParams): FormData {
		const formData = new FormData();
		params.forEach((value, key) => {
			formData.append(key, value);
		});
		return formData;
	}

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		let form = event.target as HTMLFormElement;
		errors = invalidElements(form);
		if (showErrors) {
			pageScroll = 0;
		} else if (currentPage < totalPages) {
			currentPage += 1;
		} else {
			console.log('SUBMIT');
		}

		// const formData = new FormData(form);
		// const formParams = formDataToUrlSearchParams(formData);
		// console.log(formParams);
	}
</script>

<svelte:window bind:scrollY={pageScroll} />
{#if showErrors}
	<ErrorFields {errors} />
{/if}
<form
	id="survey-form"
	autocomplete="off"
	novalidate
	onsubmit={handleSubmit}
	name="survey-form"
	class="mt-0 grid grid-cols-1 gap-6 overflow-y-scroll pb-6"
>
	<h2 class="relative bg-yellow-500 py-4 text-center text-xl font-black text-white md:text-2xl">
		{survey.title}
	</h2>
	<div class="flex w-full flex-col px-6 lg:mx-auto lg:max-w-4xl lg:justify-center">
		<!-- {#if showErrors}
			<ErrorFields {errors} />
		{/if} -->

		{#each survey.pages as sp, index}
			{#if currentPage === index + 1}
				<!-- <div
					class="class={`"flex duration-700" flex-col space-y-12 transition-all ease-in ${showErrors ? 'translate-y-8' : 'translate-y-0'}`}"
				> -->
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
				<!-- </div> -->
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

				<button
					type="submit"
					class="w-full cursor-pointer rounded-sm border border-green-600 px-4 py-2.5 text-green-600 hover:ring-2 hover:ring-green-600/30 md:w-24"
					>{currentPage === totalPages ? 'Submit' : 'Next'}</button
				>
			</div>
			<PageProgress item={'Page'} max={totalPages} value={currentPage} />
		</menu>
	</div>
</form>
