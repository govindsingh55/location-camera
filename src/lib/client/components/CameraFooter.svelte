<script lang="ts">
	let props = $props();
</script>

<footer
	class="fixed bottom-0 left-0 z-20 flex w-full items-center justify-center border-t border-base-200 bg-base-100 px-1 py-2 sm:px-2"
>
	<button
		class="btn flex w-full max-w-sm items-center justify-center gap-2 text-base btn-success sm:text-lg"
		style="min-height:2.75rem;"
		onclick={props.onCapture}
	>
		<span>Capture Photo</span>
	</button>
</footer>
