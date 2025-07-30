

<script lang="ts">
let props = $props();
</script>

<div class="flex flex-col items-center gap-4 w-full px-2">
  <img
    src={props.src}
    alt="Captured"
    class="aspect-video w-full max-w-md rounded-box border border-base-200 object-cover shadow"
  />
  <button class="btn w-full max-w-md btn-primary" onclick={props.onRetake}>Retake</button>
</div>
