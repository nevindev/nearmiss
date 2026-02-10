<script lang="ts">
    import { onMount } from "svelte";
    import { dateToDatetimeLocalString, subtractYears } from "$lib/dateutils";
	import { page } from "$app/state";
    type Props = {
		key: string;
		required?: boolean;
        disabled?: boolean;
        useUrlParams?: boolean;
        date?: Date;
        yearsBack?: number;
        inputChanged: (invalid: boolean) => void;
    }

    let {key = 'date', required = false, disabled = false, useUrlParams = false, date = new Date(), yearsBack = date.getFullYear(), inputChanged}: Props = $props()
    
    let min = $derived(dateToDatetimeLocalString(subtractYears(date, yearsBack)))
    let dateString = $state<string|null>()
    let invalid = $derived(required && dateString?.length === 0)

    onMount(() => {
		if (useUrlParams) {
			dateString = page.url.searchParams.get(key);
		} else {
            dateString = dateToDatetimeLocalString(date)
        }
	});

	function handleChange() {
		page.url.searchParams.set(key, dateString ? dateString : '');
		window.history.pushState({}, '', '?' + $state.snapshot(page.url.searchParams.toString()));
		inputChanged(invalid);
	}

    function now() {
        dateString = dateToDatetimeLocalString(new Date())
        handleChange()
    }
</script>

<input
    class="text-slate-900 shrink"
    name={key}
    type="datetime-local"
    {min}
    max={dateToDatetimeLocalString(new Date())}
    bind:value={dateString}
    {required}
    {disabled}
    onblur={handleChange}
/>
<button
type="button"
{disabled}
class="enabled:pointer-events-auto enabled:cursor-pointer rounded-md px-4 py-2 font-bold text-black enabled:hover:bg-slate-200"
onclick={now}>Now</button
>
