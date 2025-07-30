<script lang="ts">
	let props = $props();
</script>

<div class="flex w-full flex-col items-center gap-4 px-2">
	<img
		src={props.src}
		alt="Captured"
		class="aspect-video w-full max-w-sm rounded-box border border-base-200 object-cover shadow"
		style="max-height:60vh;"
	/>
	<button
		class="btn w-full max-w-sm text-base btn-primary sm:text-lg"
		style="min-height:2.75rem;"
		onclick={props.onRetake}>Retake</button
	>
</div>
