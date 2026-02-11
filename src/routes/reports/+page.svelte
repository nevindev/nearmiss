<script lang="ts">
	import ReportDetail from '$lib/components/reports/ReportDetail.svelte';
	import type { Report, SurveyAnswer } from '$lib/types';
	import { db } from '$lib/db';
	import { liveQuery } from 'dexie';

	interface ReportsMapEntry {
		report: Report;
		surveyAnswers?: SurveyAnswer[];
	}

	let reports = liveQuery(() => db.reports.toArray());
	let surveyAnswers = liveQuery(() => db.surveyAnswers.toArray());

	let reportsMap: Map<number | string, ReportsMapEntry> = $derived.by(() => {
		if (!$reports || !$surveyAnswers) return new Map();
		return getReportsWithSurveyAnswers($reports, $surveyAnswers);
	});

	function getReportsWithSurveyAnswers(
		reports: Report[],
		surveyAnswers: SurveyAnswer[]
	): Map<number | string, ReportsMapEntry> {
		let reportsMap = new Map(
			reports.map((report) => [
				report.id,
				{ report: report, surveyAnswers: new Array<SurveyAnswer>() }
			])
		);
		surveyAnswers.forEach((surveyAnswer) => {
			const entry = reportsMap.get(surveyAnswer.report_id);
			if (entry != undefined) {
				entry.surveyAnswers = [...entry.surveyAnswers, surveyAnswer];
				reportsMap.set(surveyAnswer.report_id, entry);
			}
		});
		return reportsMap;
	}
</script>

{#if $reports && $reports.length > 0}
	<ul class="mt-6 mb-16 grid grid-cols-1 gap-4 px-2 lg:grid-cols-2">
		{#each reportsMap as [_key, entry](entry.report.id)}
			<ReportDetail report={entry.report} surveyAnswers={entry.surveyAnswers}></ReportDetail>
		{/each}
	</ul>
{:else}
	<p class="mt-16 text-center text-xl font-bold text-slate-400">You have not created any reports</p>
{/if}
