
<script lang="ts">
let props = $props();
</script>

<div class="flex min-h-screen w-full flex-col items-center justify-center bg-base-200 px-3 sm:px-6">
  <div class="flex flex-col items-center gap-4 w-full max-w-sm">
    <span class="loading loading-spinner loading-lg"></span>
    <span class="text-base sm:text-lg font-semibold text-center">{props.message ?? 'Loading...'}</span>
  </div>
</div>
