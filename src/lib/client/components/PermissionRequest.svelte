<script lang="ts">
	let props = $props();
</script>

<div class="flex min-h-[80vh] w-full flex-col items-center justify-center gap-6 px-3 py-6">
	<span class="material-symbols-outlined text-5xl text-primary">photo_camera</span>
	<h2 class="text-center text-lg font-bold sm:text-xl">Camera Permission Required</h2>
	<p class="text-center text-sm text-base-content/80 sm:text-base">
		To use this app, please allow camera access.
	</p>
	<button
		class="btn w-full max-w-sm text-base btn-primary sm:text-lg"
		style="min-height:2.75rem;"
		onclick={props.onRequestPermission}>Allow Camera Access</button
	>
</div>
