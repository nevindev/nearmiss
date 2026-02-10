<script lang="ts">
	import { uniqueBy } from '$lib/utils';
	import type { Survey, SurveyAnswer } from '$lib/types';
	import {updateSurveyAnswerText, updateSurveyAnswerLastPageViewed} from '$lib/db'
	import FormReset from './elements/FormReset.svelte';
	import ErrorFields from './elements/ErrorFields.svelte';
	import FieldSet from './elements/FieldSet.svelte';
	import PageProgress from './elements/PageProgress.svelte';

	type Props = {
		surveyAnswer: SurveyAnswer;
		survey: Survey;
		currentPage?: number;
		onFormSubmit: (surveyAnswer: SurveyAnswer) => void;
	};

	let { surveyAnswer, survey, currentPage = 1, onFormSubmit }: Props = $props();
	let pageScroll = $state<number>(0);
	let errors = $state<HTMLElement[]>([]);

	let totalPages = $derived(survey.pages.length);
	let showErrors = $derived(errors.length > 0);

	let formData = new FormData();

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

	function updateFormData(surveyAnswer: SurveyAnswer, form: HTMLFormElement): void {
		const data = new FormData(form);
		for (const [key, value] of data.entries()) {
			formData.append(key, value);
		}
		const formObj = Object.fromEntries(
			[...formData.keys()].map((key) => [key, [...new Set(formData.getAll(key))]])
		);
		updateSurveyAnswerText(JSON.stringify(formObj), surveyAnswer)
		updateSurveyAnswerLastPageViewed(currentPage, surveyAnswer)

	}

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		const form = event.target as HTMLFormElement;
		errors = invalidElements(form);
		if (showErrors) {
			pageScroll = 0;
		} else if (currentPage < totalPages) {
			pageScroll = 0;
			currentPage += 1;
			updateFormData(surveyAnswer, form);
		} else {
			updateFormData(surveyAnswer, form);
			onFormSubmit(surveyAnswer);
		}
	}
</script>

<svelte:window bind:scrollY={pageScroll} />
{#if showErrors}
	<ErrorFields {errors} />
{:else if !surveyAnswer.submitted}
	<FormReset
		onReset={() => {
			pageScroll = 0;
			currentPage = 1;
			updateSurveyAnswerText("", surveyAnswer)
			updateSurveyAnswerLastPageViewed(currentPage, surveyAnswer)
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
							<FieldSet {question} {showErrors} disabled={surveyAnswer.submitted} bind:errors />
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
						disabled={surveyAnswer.submitted}
						class="w-full cursor-pointer rounded-sm border border-green-600 bg-green-600 disabled:bg-green-600/60 disabled:pointer-events-none px-4 py-2.5 text-white hover:ring-2 hover:ring-green-600/30 md:w-24"
						>{surveyAnswer.submitted ? 'Submitted' : 'Submit'}</button
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
