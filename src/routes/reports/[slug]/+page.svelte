<script lang="ts">
	import { db } from '$lib/db';
	import { onMount } from 'svelte';
	import type { PageProps } from './$types';
	import type { Report, Survey } from '$lib/types';
	import { keysForQuestionType } from '$lib/surveyutils';
	import surveyData from '$lib/data/survey.json';
	import SurveyForm from '$lib/components/forms/SurveyForm.svelte';
	import { dateToDatetimeLocalString } from '$lib/dateutils';
	import { page } from '$app/state';

	let { data }: PageProps = $props();
	let survey: Survey = surveyData;
	let report = $state<Report>();

	onMount(async () => {
		report = await db.reports.get(Number(data.params.slug));
		if (report != undefined) {
			if (report.date) {
				const keys = keysForQuestionType(survey, 'date');
				keys.forEach((key) => {
					if (report?.date) {
						page.url.searchParams.set(key, dateToDatetimeLocalString(report.date));
					}
				});
			}
			if (report.position) {
				const keys = keysForQuestionType(survey, 'geospatial');
				keys.forEach((key) => {
					page.url.searchParams.set(key, `${report?.position[0]}, ${report?.position[1]}`);
				});
			}

			window.history.pushState({}, '', '?' + $state.snapshot(page.url.searchParams.toString()));
		}
	});

	function handleFormSubmit(formData: FormData) {
		for (var pair of formData.entries()) {
			console.log(pair[0] + ', ' + pair[1]);
		}
	}
</script>

<div class="flex w-full flex-col overflow-y-auto">
	<SurveyForm {survey} onFormSubmit={handleFormSubmit} />
</div>
