<script lang="ts">
	import type { Question } from '$lib/types';
	import { page } from '$app/state';
	type Props = {
		key: string;
		required?: boolean;
	};

	let { key, required = false }: Props = $props();

	let content = $state(page.url.searchParams.get(key));

	// $effect(() => {
	// 	if (content) {
	// 		page.url.searchParams.set(key, content);
	// 		// window.history.pushState({}, '', '?' + page.url.searchParams.toString());
	// 	}
	// });

	function changeContent(target: HTMLTextAreaElement | null) {
		if (target !== null) {
			content = target.value;
      page.url.searchParams.set(key, content);
			window.history.pushState({}, '', '?' + page.url.searchParams.toString());
			// onChange(question.key);
		}
	}
</script>

<textarea
	class="my-4 w-full rounded-sm font-normal focus:ring-4 focus:ring-green-500/30"
	name={key}
	rows="5"
	cols="36"
	maxlength="1000"
	onchange={(e) => changeContent(e.target as HTMLTextAreaElement)}
	{required}>{content}</textarea
>
