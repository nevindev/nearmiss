<script lang="ts">
	import { db, updateReportSubmitted } from '$lib/db';
	import { onMount } from 'svelte';
	import type { PageProps } from './$types';
	import type { Report, Survey } from '$lib/types';
	import surveyData from '$lib/data/survey.json';
	import EnhancedForm from '$lib/components/forms/EnhancedForm.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import { page } from '$app/state';
	// import MapDisplay from '$lib/components/MapDisplay.svelte';
	// import MapContainer from '$lib/components/MapContainer.svelte';
	// import KeyValue from '$lib/components/KeyValue.svelte';

	let { data }: PageProps = $props();

	let survey: Survey = surveyData;

	let report = $state<Report>();
	let showModal = $state<boolean>(false);

	onMount(async () => {
		report = await db.reports.get(Number(data.params.slug));
		if (report != undefined) {
			if (report.date) {
				page.url.searchParams.set('date', report.date.toJSON());
			}
			if (report.position) {
				page.url.searchParams.set('position', `${report.position[0]}, ${report.position[1]}`);
			}

			window.history.pushState({}, '', '?' + $state.snapshot(page.url.searchParams.toString()));
		}
	});

	function reset() {
		if (report !== undefined) {
			showModal = true;
		}
	}

	function handleModalSubmit() {
		// group.forEach((entry) => page.url.searchParams.append(question.key, entry));
		window.history.pushState({}, '', '');
		// if (report !== undefined) {
		// 	let incident: Incident = createDefaultIncident(report.incident.point);
		// 	report.incident = incident;
		// 	showModal = false;
		// }
	}

	function handleModalClose() {
		showModal = false;
	}

	function handleFormSubmit(surveyData: { [key: number]: URLSearchParams }) {
		console.log($state.snapshot(surveyData));
	}
</script>

{#snippet content()}
	<div class="mx-8 flex flex-col space-y-4">
		<h3 class="text lg font-bold">Reset this Survey?</h3>
		<p>Resetting this survey will remove all answers.</p>
	</div>
{/snippet}

<!-- {#if report} -->
<!-- {#if !report.submitted} -->
<!-- <button
	class="sticky top-16 z-[999] w-full cursor-pointer self-start bg-slate-500/20 py-2 text-sm font-medium text-slate-900 backdrop-blur-lg backdrop-filter hover:font-bold hover:underline"
	onclick={reset}>Reset Form</button
> -->
<div class="flex flex-col overflow-y-scroll">
	<!-- <ReportForm {report} onSubmit={handleFormSubmit} /> -->
	<!-- <SurveyForm {survey} /> -->
	<EnhancedForm {survey} />
</div>
{#if showModal}
	<Modal
		action={'Reset'}
		onSubmit={handleModalSubmit}
		onClose={handleModalClose}
		children={content}
	/>
{/if}
<!-- {:else if report.submitted}
		<div class="flex flex-col p-8 space-y-6"> -->
<!-- <div class="flex flex-row justify-start w-full"> -->
<!-- <a class="self-start" href="/reports">&lt; Back to Reports</a>
			{#each Object.entries($state.snapshot(report.incident)) as [key, value]}
				<KeyValue {key} {value}></KeyValue>
			{/each}

			<div class="aspect-square max-w-1/2">
				<MapContainer point={report.incident.point} interactive={true} zoom={20} />
			</div>
		</div>
	{/if}
{:else}
	<h3>There is nothing here! <br />This report may have been deleted</h3>
	<a href="/reports">Back to Reports</a>
{/if} -->
