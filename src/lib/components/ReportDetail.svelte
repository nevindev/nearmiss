<script lang="ts">
	import type { OTPResponse, OTPRequest, Report, APIResponse } from '$lib/types';
	import { deleteReport, getOTP } from '$lib/api';
	import MapContainer from './MapContainer.svelte';
	import OTPForm from './OTPForm.svelte';
	import { db } from '$lib/db';
	import { dateToCalendarFormat, dateTohhmmss, dateToMMddYYYY } from '$lib/dateutils';
	type Props = {
		report: Report;
	};

	let { report }: Props = $props();

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

	function surveyStatus(report: Report): string {
		if (report.submitted) {
			return 'View';
		} else if (report.survey !== undefined) {
			return 'Resume';
		} else {
			return 'Begin';
		}
	}

	// function reportTypes(report: Report): string {
	// 	if (report.incident.report_types.length === 0) {
	// 		return 'Incident';
	// 	} else {
	// 		return `${report.incident.report_types.join(' / ')}`;
	// 	}
	// }
	// // impacting a ${report.incident.impacted.join(', a ')}
	// function reportingOn(report: Report): string {
	// 	if (report.incident.reporting !== '') {
	// 		return `with a ${report.incident.reporting.toLocaleLowerCase()}`;
	// 	} else {
	// 		return '';
	// 	}
	// }

	// function impacted(report: Report): string {
	// 	// if (report.incident.impacted.length === 1) {
	// 	return `a ${report.incident.impacted.join('a, ')}`;
	// 	// }
	// }
</script>

<li
	class="flex h-32 w-full flex-row items-center justify-between space-x-4 overflow-hidden rounded-md border-b border-slate-200 bg-slate-100 px-4 shadow-sm"
>
	<div class="aspect-square min-w-24">
		<MapContainer position={report.position} />
	</div>
	<!-- <div class="flex flex-row items-center justify-between space-x-4"> -->
	<div class="max-w-40 min-w-24 flex-1">
		<p class="text-xs font-medium">
			<!-- {report.survey_status === 'Submitted' ? 'Reported' : 'Reporting about'} -->
			<!-- {reportTypes(report)} -->
       Incident
		</p>
		<!-- <p class="text-xs font-normal">{reportingOn(report)}</p> -->
		<p class="font-mono text-xs">
			{dateToMMddYYYY(report.date)} <br />
			{dateTohhmmss(report.date)}
		</p>
	</div>

	<!-- <div class="flex-1 flex-col items-start self-center min-w-12">
			{#if report.incident.impacted.length > 0}
				<p class="text-center text-xs font-medium">Impacted</p>
			{/if}
			<div class="h-20 grid grid-flow-row grid-cols-1 md:grid-flow-col md:grid-rows-3 gap-2 overflow-scroll py-2">
				{#each report.incident.impacted as i}<p
						class="max-w-fit min-w-fit self-center rounded-full border border-slate-600 px-2 py-0.5 text-center text-xs whitespace-nowrap"
					>
						{i}
					</p>{/each}
			</div>
		</div> -->

	<div class="flex shrink-0 flex-col-reverse gap-y-2">
		<a
			class="rounded-md rounded-md border border-slate-600 px-4 py-2 text-center text-xs font-medium text-black hover:bg-slate-200"
			href="/reports/{report.id}">{surveyStatus(report)} Survey</a
		>
		{#if report.survey === undefined}
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
		{:else if report.survey && !report.submitted}
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
		{:else if report.submitted}
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
		{/if}
		<!-- </div> -->

		<!-- <p class="text-lg font-bold">{report.incident.type?.toUpperCase()}</p> -->
		<!-- <p class="text-md">on {dateToLocaleDate(report.incident.date)}</p>
		<p class="text-md">at {dateToLocaleTime(report.incident.date)}</p> -->
	</div>

	<!-- <button class="h-fit rounded-md bg-red-500 p-4 text-white hover:bg-red-600" onclick={onDelete}
		>Delete</button
	> -->
</li>

{#if otpResponse}
	<OTPForm {otpResponse} {otpError} onOTPSubmit={(otp) => handleOTPSubmit(otp)} onClose={clearOTP}
	></OTPForm>
{/if}
