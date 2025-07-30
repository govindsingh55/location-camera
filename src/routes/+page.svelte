<script lang="ts">
	let videoEl: HTMLVideoElement | null = null;
	let canvasEl: HTMLCanvasElement | null = null;
	let stream: MediaStream | null = null;
	let capturedImage: string | null = null;
	let error: string | null = null;
	let isCameraActive = false;

	import { onMount } from 'svelte';

	async function startCamera() {
		error = null;
		capturedImage = null;
		// Check for mediaDevices and getUserMedia support (modern and legacy)
		const hasModern =
			navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function';
		const hasLegacy = typeof (navigator as any).getUserMedia === 'function';
		if (!hasModern && !hasLegacy) {
			error = 'Camera not supported on this device or browser.\nUserAgent: ' + navigator.userAgent;
			console.error('navigator:', navigator);
			return;
		}
		try {
			// Try environment camera first, fallback to user camera if not available
			let constraints = { video: { facingMode: { ideal: 'environment' } } };
			const getMedia = hasModern
				? (c: any) => navigator.mediaDevices.getUserMedia(c)
				: (c: any) =>
						new Promise((resolve, reject) => (navigator as any).getUserMedia(c, resolve, reject));
			try {
				stream = (await getMedia(constraints)) as MediaStream;
			} catch (err) {
				// fallback to user camera
				constraints = { video: { facingMode: { ideal: 'user' } } };
				stream = (await getMedia(constraints)) as MediaStream;
			}
			isCameraActive = true;
			await tick();
			if (videoEl) {
				videoEl.srcObject = stream;
				videoEl.muted = true; // for mobile autoplay
				videoEl.setAttribute('playsinline', 'true'); // for iOS Safari
				await videoEl.play();
			}
		} catch (e) {
			console.error('Camera access error:', e);
			error = 'Unable to access camera. ' + (e instanceof Error ? e.message : '');
		}
	}

	import { tick } from 'svelte';

	function stopCamera() {
		if (stream) {
			stream.getTracks().forEach((track) => track.stop());
			stream = null;
		}
		isCameraActive = false;
	}

	function capture() {
		if (!videoEl || !canvasEl) return;
		const w = videoEl.videoWidth;
		const h = videoEl.videoHeight;
		canvasEl.width = w;
		canvasEl.height = h;
		const ctx = canvasEl.getContext('2d');
		if (ctx) {
			ctx.drawImage(videoEl, 0, 0, w, h);
			capturedImage = canvasEl.toDataURL('image/png');
		}
		stopCamera();
	}

	function retake() {
		capturedImage = null;
		startCamera();
	}
</script>

<div class="flex min-h-[80vh] flex-col items-center justify-center gap-4 px-2 py-4">
	<h1 class="mb-2 text-center text-2xl font-bold">Camera App</h1>

	{#if error}
		<div class="alert w-full max-w-xs alert-error">{error}</div>
	{/if}

	{#if capturedImage}
		<div class="flex w-full flex-col items-center gap-4">
			<img
				src={capturedImage}
				alt="Captured"
				class="aspect-video w-full max-w-xs rounded-box border border-base-200 object-cover shadow"
			/>
			<button class="btn w-full max-w-xs btn-primary" on:click={retake}>Retake</button>
		</div>
	{:else if isCameraActive}
		<div
			class="relative aspect-video w-full max-w-xs overflow-hidden rounded-box border border-base-200 shadow"
		>
			<video
				bind:this={videoEl}
				autoplay
				playsinline
				muted
				class="h-full w-full bg-black object-cover"
				style="display: block;"
			></video>
			<button
				class="btn absolute bottom-2 left-1/2 z-10 w-11/12 max-w-xs -translate-x-1/2 btn-success"
				on:click={capture}
			>
				<span class="material-symbols-outlined mr-1 align-middle">photo_camera</span> Capture Photo
			</button>
		</div>
		<button class="btn mt-2 w-full max-w-xs btn-ghost" on:click={stopCamera}>Close Camera</button>
	{:else}
		<button class="btn w-full max-w-xs btn-primary" on:click={startCamera}>Open Camera</button>
	{/if}
	<canvas bind:this={canvasEl} class="hidden"></canvas>
</div>
