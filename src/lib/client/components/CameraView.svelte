<script lang="ts">
	let { videoEl = $bindable() } = $props();
</script>

<div
	class="relative aspect-video h-full w-full max-w-sm overflow-hidden rounded-box border border-base-200 object-contain shadow"
>
	<video
		bind:this={videoEl}
		autoplay
		playsinline
		muted
		class="h-full w-full rounded-box bg-black object-cover"
		style="display: block; touch-action:manipulation;"
	></video>
</div>
