<script lang="ts">
	import type { OTPResponse, OTPRequest, Report, APIResponse, SurveyAnswer } from '$lib/types';
	import { deleteReport } from '$lib/api';
	import MapDetail from '../maps/MapDetail.svelte';
	import OTPForm from '../forms/OTPForm.svelte';
	import SurveyDetail from '../surveys/SurveyDetail.svelte';
	import { db } from '$lib/db';
	import { dateTohhmmss, dateToMMddYYYY } from '$lib/dateutils';
	type Props = {
		report: Report;
		surveyAnswers?: SurveyAnswer[];
	};

	let { report, surveyAnswers }: Props = $props();

	let otpResponse = $state<OTPResponse>();
	let otpError = $state<Error>();

	function clearOTP() {
		otpError = undefined;
		otpResponse = undefined;
	}

	async function onDelete() {
		// let result: APIResponse = await getOTP({
		// 	user_id: report.user_id
		// } as OTPRequest);
		// otpResponse = result.otp_response;
		db.reports.delete(report.id);
	}

	async function handleOTPSubmit(otp?: string) {
		let result: APIResponse = await deleteReport(report, otp, otpResponse?.secret);
		if (!result.success) {
			otpError = result.error;
		} else if (result.success) {
			clearOTP();
			db.reports.delete(report.id);
		}
	}
</script>

<li
	class="flex h-32 w-full flex-row items-center justify-between space-x-4 overflow-hidden rounded-md border-b border-slate-200 bg-slate-100 px-4 shadow-sm"
>
	<a class="aspect-square min-w-24 cursor-pointer" href={`/map/?selected=${report.id}`}>
		<MapDetail position={report.position} />
	</a>
	<div class="max-w-40 min-w-24 flex-1">
		<p class="text-xs font-medium">Incident</p>
		<p class="font-mono text-xs">
			{dateToMMddYYYY(report.date)} <br />
			{dateTohhmmss(report.date)}
		</p>
	</div>
	{#if surveyAnswers && surveyAnswers.length > 0}
		{#each surveyAnswers as surveyAnswer}
			<SurveyDetail report_id={report.id} {surveyAnswer}></SurveyDetail>
		{/each}
	{:else}
		<SurveyDetail report_id={report.id} surveyAnswer={undefined}></SurveyDetail>
	{/if}
	<button
		class="h-fit cursor-pointer rounded-md bg-red-500 p-4 text-white hover:bg-red-600"
		onclick={onDelete}>Delete</button
	>
</li>

{#if otpResponse}
	<OTPForm {otpResponse} {otpError} onOTPSubmit={(otp) => handleOTPSubmit(otp)} onClose={clearOTP}
	></OTPForm>
{/if}
