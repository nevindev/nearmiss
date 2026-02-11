<script lang="ts">
	import { goto } from "$app/navigation";
    import Modal from "$lib/components/ui/Modal.svelte";
    
	type Props = {
		onReset: () => void;
	};

	let { onReset }: Props = $props();

    let showModal = $state(false)

	function handleModalSubmit() {
        goto('?')
		showModal = false;
        onReset()
	}

</script>

<button
	type="button"
	class="fixed top-16 z-[999] flex min-h-fit w-full cursor-pointer items-center justify-center bg-slate-500/70 p-1 text-white"
	tabindex="0"
	onclick={() => showModal = true}
>
	Reset Form
</button>

{#if showModal}
	<Modal
		action={'Reset'}
		onSubmit={handleModalSubmit}
		onClose={() => showModal = false}>
		<div class="mx-8 flex flex-col space-y-4">
			<h3 class="text lg font-bold">Reset this Survey?</h3>
			<p>Resetting this survey will remove all answers.</p>
		</div>
	</Modal>
{/if}