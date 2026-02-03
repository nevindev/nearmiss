<script lang="ts">
	import type { Snippet } from "svelte";
	type Props = {
    action? :string
    children?: Snippet;
		onSubmit: () => void;
		onClose: () => void;
	};

	let { action="Confirm", children, onSubmit, onClose }: Props = $props();
</script>

<div
	class="pointer-events-none fixed inset-0 z-[999] h-dvh w-screen bg-slate-900/50 backdrop-blur-xs transition-opacity duration-300"
>
	<dialog
		class="fixed top-1/2 left-1/2 max-w-[50%] min-w-screen -translate-x-1/2 -translate-y-[50%] rounded-lg bg-white py-6 md:max-w-[75%] md:min-w-[70%] md:shadow-md lg:max-w-[50%] lg:min-w-[40%]"
		open
	>
		<div class="flex h-dvh flex-col items-center justify-center space-y-4 md:h-1/2">
      {@render children?.()}
			<menu class="mt-4 mr-6 space-x-2 self-end">
				<button
					class="pointer-events-auto cursor-pointer rounded-md px-4 py-2 font-bold text-black hover:bg-slate-200"
					onclick={onClose}>Cancel</button
				>
				<button
					class="pointer-events-auto cursor-pointer rounded-md bg-indigo-500 px-4 py-2 font-bold text-white hover:bg-indigo-600 disabled:bg-indigo-200"
					onclick={onSubmit}>{action}</button
				>
			</menu>
		</div>
	</dialog>
</div>
