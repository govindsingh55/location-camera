

<script lang="ts">
let props = $props();
</script>

<footer class="fixed bottom-0 left-0 w-full bg-base-100 border-t border-base-200 flex justify-center items-center py-3 z-20 px-2">
  <button class="btn btn-success w-full max-w-md flex items-center justify-center gap-2 text-lg sm:text-xl" style="min-height:3rem;" onclick={props.onCapture}>
    <span>Capture Photo</span>
  </button>
</footer>
