<script lang="ts">
	import AppLoading from '../lib/client/components/AppLoading.svelte';
	import PermissionRequest from '../lib/client/components/PermissionRequest.svelte';
	import CameraFooter from '../lib/client/components/CameraFooter.svelte';
	import CameraView from '../lib/client/components/CameraView.svelte';
	import CapturedImage from '../lib/client/components/CapturedImage.svelte';
	import { tick } from 'svelte';

	type State = {
		videoEl: HTMLVideoElement | null;
		canvasEl: HTMLCanvasElement | null;
		stream: MediaStream | null;
		capturedImage: string | null;
		error: string | null;
		isCameraActive: boolean;
		isLoading: boolean;
		permissionState: 'unknown' | 'prompt' | 'granted' | 'denied';
		location: string;
		gallery: string[];
		db: IDBDatabase | undefined;
	};

	const state = $state<State>({
		videoEl: null,
		canvasEl: null,
		stream: null,
		capturedImage: null,
		error: null,
		isCameraActive: false,
		isLoading: true,
		permissionState: 'unknown',
		location: 'Locating...',
		gallery: [],
		db: undefined
	});

	// --- IndexedDB Setup ---
	async function openDB() {
		return new Promise<IDBDatabase>((resolve, reject) => {
			const request = indexedDB.open('GeoGalleryDB', 1);
			request.onerror = () => reject('DB open failed');
			request.onsuccess = () => resolve(request.result);
			request.onupgradeneeded = (e) => {
				// @ts-ignore
				const db = e.target.result;
				db.createObjectStore('images', { keyPath: 'id', autoIncrement: true });
			};
		});
	}

	async function syncGalleryToIndexedDB(images: string[]) {
		if (!state.db) state.db = await openDB();
		const tx = state.db.transaction('images', 'readwrite');
		const store = tx.objectStore('images');
		store.clear();
		images.forEach((img) => store.add({ data: img }));
	}

	async function restoreGalleryFromIndexedDB() {
		if (!state.db) state.db = await openDB();
		const tx = state.db.transaction('images', 'readonly');
		const store = tx.objectStore('images');
		const getAllReq = store.getAll();
		getAllReq.onsuccess = function () {
			state.gallery = getAllReq.result.map((entry) => entry.data);
		};
	}

	function deleteImage(index: number) {
		state.gallery = state.gallery.toSpliced(index, 1);
		localStorage.setItem('geo_gallery', JSON.stringify(state.gallery));
		syncGalleryToIndexedDB(state.gallery);
	}

	// --- Geolocation ---
	async function fetchAddress(lat: number, lon: number) {
		const cacheKey = `geo_${lat.toFixed(4)}_${lon.toFixed(4)}`;
		const cached = localStorage.getItem(cacheKey);
		if (cached) return cached;
		try {
			const res = await fetch(
				`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`
			);
			const data = await res.json();
			const address = data.display_name || `Lat: ${lat}\nLon: ${lon}`;
			localStorage.setItem(cacheKey, address);
			return address;
		} catch (err) {
			return `Lat: ${lat}\nLon: ${lon}`;
		}
	}

	$effect(() => {
		(async () => {
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(
					async (pos) => {
						const { latitude, longitude } = pos.coords;
						state.location = await fetchAddress(latitude, longitude);
					},
					() => {
						state.location = 'Location access denied or unavailable';
					}
				);
			} else {
				state.location = 'Geolocation not supported';
			}
			await restoreGalleryFromIndexedDB();
			await syncGalleryToIndexedDB(state.gallery);
			state.isLoading = false;
		})();
	});

	// --- Camera logic (keep your structure) ---
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
			// Overlay location and timestamp
			const lines = [...state.location.split(/,|\n/), new Date().toLocaleString()];
			ctx.font = '16px sans-serif';
			ctx.fillStyle = 'white';
			ctx.shadowColor = 'black';
			ctx.shadowBlur = 5;
			ctx.textAlign = 'right';
			let y = h - 30;
			lines.reverse().forEach((line) => {
				ctx.fillText(line.trim(), w - 20, y);
				y -= 22;
			});
			state.capturedImage = state.canvasEl.toDataURL('image/jpeg');
			// Add to gallery
			state.gallery = [state.capturedImage, ...state.gallery];
			localStorage.setItem('geo_gallery', JSON.stringify(state.gallery));
			syncGalleryToIndexedDB(state.gallery);
		}
		stopCamera();
	}

	function retake() {
		state.capturedImage = null;
	}
</script>

<main
	class={[
		'flex min-h-screen flex-col items-center justify-center border bg-base-100 px-1 sm:px-0',
		state.permissionState === 'granted' && 'justify-end'
	]}
>
	{#if state.isLoading}
		<AppLoading message="Opening app..." />
	{:else if state.error}
		<div class="alert w-full max-w-sm alert-error text-sm sm:text-base">{state.error}</div>
	{:else if state.capturedImage}
		<div class="flex h-full w-full grow flex-col items-center">
			<CapturedImage
				src={state.capturedImage}
				onRetake={retake}
				class="h-full w-full flex-1 object-contain"
			/>
		</div>
	{:else if state.isCameraActive}
		<div class="flex h-full w-full flex-1 grow flex-col items-center">
			<div class="flex w-full flex-1 items-center justify-center">
				<CameraView bind:videoEl={state.videoEl} />
			</div>
			<CameraFooter onCapture={capture} />
			<button
				class="btn mt-2 w-full max-w-sm text-base btn-ghost sm:text-lg"
				style="min-height:2.5rem;"
				onclick={stopCamera}>Close Camera</button
			>
		</div>
	{:else if state.permissionState === 'prompt' || state.permissionState === 'unknown'}
		<PermissionRequest onRequestPermission={startCamera} />
	{:else if state.permissionState === 'granted'}
		<button
			class="btn w-full max-w-sm text-base btn-primary sm:text-lg"
			style="min-height:2.75rem;"
			onclick={startCamera}>Open Camera</button
		>
	{:else}
		<div class="alert w-full max-w-sm alert-error text-sm sm:text-base">
			Camera permission denied. Please enable camera access in your browser settings.
		</div>
	{/if}
	<canvas bind:this={state.canvasEl} class="hidden"></canvas>

	{#if state.gallery.length > 0}
		<h2 class="mt-6 text-lg font-bold">📷 Gallery</h2>
		<div class="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
			{#each state.gallery as image, index (image)}
				<div class="group relative overflow-hidden rounded shadow">
					<img
						src={image}
						alt="Snapshot"
						class="h-auto w-full transition-transform duration-300 group-hover:scale-105"
						loading="lazy"
						ontouchstart={() => deleteImage(index)}
					/>
					<button
						onclick={() => deleteImage(index)}
						class="absolute top-1 right-1 rounded bg-red-500 px-2 py-1 text-xs text-white opacity-80 hover:opacity-100"
					>
						✕
					</button>
				</div>
			{/each}
		</div>
	{/if}
</main>
