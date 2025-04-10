<script lang="ts">
	type Props = {
		item?: string;
		max: number;
		value: number;
	};

	let { item = 'page', max, value }: Props = $props();
</script>

<div class="flex flex-row w-4/5 items-center space-x-2 md:space-x-4">
	<progress
		class="h-2.5 w-full rounded-full [&::-moz-progress-bar]:bg-green-600 [&::-webkit-progress-bar]:rounded-lg [&::-webkit-progress-bar]:bg-slate-300 [&::-webkit-progress-value]:rounded-lg [&::-webkit-progress-value]:bg-green-600"
		id="{item}-progress"
		{max}
		{value}
	></progress>
	<label class="text-lg whitespace-nowrap font-thin" for="progress">{item} {value} of {max}</label>
</div>
