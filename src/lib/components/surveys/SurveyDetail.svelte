<script lang="ts">
	import type { SurveyAnswer } from '$lib/types';
	type Props = {
		report_id: string | number
		surveyAnswer?: SurveyAnswer;
	};
	let { report_id, surveyAnswer }: Props = $props();

	function surveyStatus(surveyAnswer?: SurveyAnswer): string {
		if (surveyAnswer == undefined) {
			return 'Begin';
		} else if (surveyAnswer.submitted) {
			return 'View';
		} else {
			return 'Resume';
		}
	}
</script>

<div class="flex shrink-0 flex-col-reverse gap-y-2">
	<a
		class="rounded-md rounded-md border border-slate-600 px-4 py-2 text-center text-xs font-medium text-black hover:bg-slate-200"
		href="/reports/{report_id}">{surveyStatus(surveyAnswer)} Survey</a
	>
	{#if surveyAnswer === undefined}
		<div class="flex flex-col items-center">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
				class="h-6 w-6 w-8 md:h-8"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
				/>
			</svg>
			<p class="text-xs font-medium">Not Started</p>
		</div>
	{:else if surveyAnswer.submitted}
		<div class="flex flex-col items-center">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
				class="h-6 w-6 w-8 md:h-8"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
				/>
			</svg>
			<p class="text-xs font-medium">Submitted</p>
		</div>
	{:else}
		<div class="flex flex-col items-center">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
				class="h-6 w-6 w-8 md:h-8"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
				/>
			</svg>
			<p class="text-xs font-medium">In Progress</p>
		</div>
	{/if}
</div>
