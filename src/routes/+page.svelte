<script lang="ts">
	import AppLoading from '../lib/client/components/AppLoading.svelte';
	import PermissionRequest from '../lib/client/components/PermissionRequest.svelte';
	import CameraFooter from '../lib/client/components/CameraFooter.svelte';
	import CameraView from '../lib/client/components/CameraView.svelte';
	import CapturedImage from '../lib/client/components/CapturedImage.svelte';
	import { tick } from 'svelte';

	const state = $state({
		videoEl: null as HTMLVideoElement | null,
		canvasEl: null as HTMLCanvasElement | null,
		stream: null as MediaStream | null,
		capturedImage: null as string | null,
		error: null as string | null,
		isCameraActive: false,
		isLoading: true,
		permissionState: 'unknown' as 'unknown' | 'prompt' | 'granted' | 'denied'
	});

	$effect(() => {
		(async () => {
			state.isLoading = true;
			const start = Date.now();
			if (navigator.permissions && navigator.permissions.query) {
				try {
					const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
					state.permissionState = result.state as typeof state.permissionState;
					result.onchange = () => {
						state.permissionState = result.state as typeof state.permissionState;
					};
				} catch {
					state.permissionState = 'unknown';
				}
			} else {
				state.permissionState = 'unknown';
			}
			const elapsed = Date.now() - start;
			if (elapsed < 400) {
				await new Promise((r) => setTimeout(r, 400 - elapsed));
			}
			state.isLoading = false;
		})();
	});

	async function startCamera() {
		state.error = null;
		state.capturedImage = null;
		state.isLoading = true;
		const hasModern =
			navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function';
		const hasLegacy = typeof (navigator as any).getUserMedia === 'function';
		if (!hasModern && !hasLegacy) {
			state.error =
				'Camera not supported on this device or browser.\nUserAgent: ' + navigator.userAgent;
			state.isLoading = false;
			return;
		}
		try {
			let constraints = { video: { facingMode: { ideal: 'environment' } } };
			const getMedia = hasModern
				? (c: any) => navigator.mediaDevices.getUserMedia(c)
				: (c: any) =>
						new Promise((resolve, reject) => (navigator as any).getUserMedia(c, resolve, reject));
			try {
				state.stream = (await getMedia(constraints)) as MediaStream;
			} catch (err) {
				constraints = { video: { facingMode: { ideal: 'user' } } };
				state.stream = (await getMedia(constraints)) as MediaStream;
			}
			state.isCameraActive = true;
			await tick();
			// videoEl assignment now handled by $effect below
			if (navigator.permissions && navigator.permissions.query) {
				try {
					const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
					state.permissionState = result.state as typeof state.permissionState;
				} catch {}
			}
		} catch (e) {
			state.error = 'Unable to access camera. ' + (e instanceof Error ? e.message : '');
		}
		state.isLoading = false;
	}

	$effect(() => {
		if (state.isCameraActive && state.videoEl && state.stream) {
			state.videoEl.srcObject = state.stream;
			state.videoEl.muted = true;
			state.videoEl.setAttribute('playsinline', 'true');
			state.videoEl.play();
		}
	});

	function stopCamera() {
		if (state.stream) {
			state.stream.getTracks().forEach((track) => track.stop());
			state.stream = null;
		}
		state.isCameraActive = false;
	}

	function capture() {
		if (!state.videoEl || !state.canvasEl) return;
		const w = state.videoEl.videoWidth;
		const h = state.videoEl.videoHeight;
		state.canvasEl.width = w;
		state.canvasEl.height = h;
		const ctx = state.canvasEl.getContext('2d');
		if (ctx) {
			ctx.drawImage(state.videoEl, 0, 0, w, h);
			state.capturedImage = state.canvasEl.toDataURL('image/png');
		}
		stopCamera();
	}

	function retake() {
		state.capturedImage = null;
		startCamera();
	}
</script>

<div
	class={[
		'flex min-h-screen flex-col items-center justify-center border bg-base-100',
		state.permissionState === 'granted' && 'justify-end'
	]}
>
	{#if state.isLoading}
		<AppLoading message="Opening app..." />
	{:else if state.error}
		<div class="alert w-full max-w-xs alert-error">{state.error}</div>
	{:else if state.capturedImage}
		<CapturedImage src={state.capturedImage} onRetake={retake} />
	{:else if state.isCameraActive}
		<div class="flex w-full flex-col items-center">
			<CameraView bind:videoEl={state.videoEl} />
			<CameraFooter onCapture={capture} />
			<button class="btn mt-2 w-full max-w-xs btn-ghost" onclick={stopCamera}>Close Camera</button>
		</div>
	{:else if state.permissionState === 'prompt' || state.permissionState === 'unknown'}
		<PermissionRequest onRequestPermission={startCamera} />
	{:else if state.permissionState === 'granted'}
		<button class="btn w-full max-w-xs btn-primary" onclick={startCamera}>Open Camera</button>
	{:else}
		<div class="alert w-full max-w-xs alert-error">
			Camera permission denied. Please enable camera access in your browser settings.
		</div>
	{/if}
	<canvas bind:this={state.canvasEl} class="hidden"></canvas>
</div>
