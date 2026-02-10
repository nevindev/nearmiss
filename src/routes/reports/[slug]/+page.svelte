<script lang="ts">
	import { db } from '$lib/db';
	import { onMount } from 'svelte';
	import type { PageProps } from './$types';
	import type { Report, Survey, SurveyAnswer } from '$lib/types';
	import { keysForQuestionType, isStringArray } from '$lib/surveyutils';
	import { getOrCreateSurveyAnswer, updateSurveyAnswerSubmitted } from '$lib/db';
	import nvfssSurvey from '$lib/data/nvfssSurvey.json';
	import wabaSurvey from '$lib/data/wabaSurvey.json';
	import SurveyForm from '$lib/components/forms/SurveyForm.svelte';
	import { dateToDatetimeLocalString } from '$lib/dateutils';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';

	let { data }: PageProps = $props();
	let surveys: Survey[] = [nvfssSurvey, wabaSurvey];
	let survey = surveys.at(0);
	let report = $state<Report>();
	let surveyAnswer = $state<SurveyAnswer>();
	let specialKeys = new Set();

	onMount(async () => {
		report = await db.reports.get(Number(data.params.slug));
		if (report != undefined && survey != undefined) {
			surveyAnswer = await getOrCreateSurveyAnswer(survey.id, report.id);
			if (report.date) {
				const keys = keysForQuestionType(survey, 'date');
				keys.forEach((key) => {
					if (report?.date) {
						specialKeys.add(keys);
						page.url.searchParams.set(key, dateToDatetimeLocalString(report.date));
					}
				});
			}
			if (report.position) {
				const keys = keysForQuestionType(survey, 'geospatial');
				keys.forEach((key) => {
					specialKeys.add(keys);
					page.url.searchParams.set(key, `${report?.position[0]}, ${report?.position[1]}`);
				});
			}
			if (surveyAnswer) {
				for (const [key, values] of Object.entries(JSON.parse(surveyAnswer.answer_string))) {
					if (isStringArray(values)) {
						values.forEach((value) => {
							if (!specialKeys.has(key)) {
								page.url.searchParams.append(key, value);
							}
						});
					}
				}
			}
			window.history.pushState({}, '', '?' + $state.snapshot(page.url.searchParams.toString()));
		}
	});

	function handleFormSubmit(surveyAnswer: SurveyAnswer) {
		console.log(surveyAnswer);
		updateSurveyAnswerSubmitted(true, surveyAnswer)
		goto('/reports')
	}
</script>

{#if surveyAnswer != undefined && survey != undefined}
	<div class="flex w-full flex-col overflow-y-auto">
		<SurveyForm {surveyAnswer} {survey} onFormSubmit={handleFormSubmit} />
	</div>
{/if}
