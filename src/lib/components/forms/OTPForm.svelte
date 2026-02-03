<script lang="ts">
	import type { OTPResponse } from '$lib/types';
	type Props = {
		otpResponse: OTPResponse;
		otpError?: Error;
		onOTPSubmit: (otp?: string) => void;
    onClose: () => void;
	};

	let { otpResponse, otpError, onOTPSubmit, onClose }: Props = $props();
	let otp = $state<string>();

	function submit() {
		onOTPSubmit(otp);
		otp = undefined;
	}
</script>

<!-- method="dialog" -->
<div
	class="pointer-events-none fixed inset-0 z-[999] h-dvh w-screen bg-slate-900/50 backdrop-blur-xs transition-opacity duration-300"
>
	<dialog
		class="fixed top-1/2 left-1/2 max-w-[50%] min-w-screen -translate-x-1/2 -translate-y-[50%] rounded-lg bg-white py-6 md:max-w-[75%] md:min-w-[70%] md:shadow-md lg:max-w-[50%] lg:min-w-[40%]"
		open
	>
		<div class="flex h-dvh flex-col items-center justify-center space-y-4 md:h-1/2">
			<p class="h-4 text-sm font-bold text-pink-600">{otpError ? otpError.message : ''}</p>
			{#if otpResponse.qr_code}
				<h4 class="text-lg font-bold">Set up One-Time Passcode Authentication</h4>

				<p class="w-2/3 text-start text-pretty md:w-3/4">
					To enable one-time password authentication, scan the image with the two-factor
					authentication app in your phone and then enter the authentication code at the bottom. <br
					/><br />If you cannot scan a QR code, enter your secret manually.
				</p>
				{@html otpResponse.qr_code}
			{:else}
				<h4 class="text-lg font-bold">Enter One-Time Passcode to Continue</h4>
				<p class="w-2/3 text-start text-pretty md:w-3/4">
					Enter the six-digit code from the two-factor authentication app in your phone
				</p>
			{/if}

			<label class="mb-2 block text-sm font-bold text-gray-700" for="otp"
				>Authentication Code
				<input
					class="focus:shadow-outline pointer-events-auto w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
					name="otp"
					type="text"
					placeholder="XXXXXX"
					minlength="6"
					required
					bind:value={otp}
				/>
			</label>
			<menu class="self-end mr-6 mt-4 space-x-2">
        <button class="pointer-events-auto rounded-md px-4 py-2 font-bold text-black hover:bg-slate-200" onclick={onClose}>Cancel</button>
				<button
					disabled={otp === undefined || otp.length < 6}
					class="pointer-events-auto rounded-md bg-indigo-500 px-4 py-2 font-bold text-white hover:bg-indigo-600 disabled:bg-indigo-200"
					onclick={submit}>Verify</button
				>
			</menu>
		</div>
	</dialog>
</div>
