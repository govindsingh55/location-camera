

<script lang="ts">
let { videoEl = $bindable() } = $props();
</script>

<div class="relative aspect-video w-full max-w-md overflow-hidden rounded-box border border-base-200 shadow">
  <video
    bind:this={videoEl}
    autoplay
    playsinline
    muted
    class="h-full w-full bg-black object-cover"
    style="display: block;"
  ></video>
</div>
