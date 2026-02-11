<script lang="ts">
	import { fade } from 'svelte/transition';
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
    out:fade
	class="flex h-28 w-full flex-row items-center justify-between space-x-2 overflow-hidden rounded-md border-b border-slate-200 bg-slate-100 px-4 shadow-sm"
>
	<a class="aspect-square min-w-20 cursor-pointer" href={`/map/?selected=${report.id}`}>
		<MapDetail position={report.position} interactive={false} />
	</a>
	<div class="max-w-18 min-w-12 flex-1">
		<p class="text-xs font-medium">Incident</p>
		<p class="font-mono text-xs whitespace-nowrap">
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
		tabindex="0"
		class="items-center rounded-md border-2 border-red-600 p-2 font-semibold text-red-600 hover:bg-red-600 hover:text-white"
		onclick={onDelete}
	>
		<!-- <span class="text-xs">Delete</span> -->
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			stroke-width="1.5"
			class="size-6 fill-none stroke-current"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
			/>
		</svg>
	</button>
</li>

{#if otpResponse}
	<OTPForm {otpResponse} {otpError} onOTPSubmit={(otp) => handleOTPSubmit(otp)} onClose={clearOTP}
	></OTPForm>
{/if}
