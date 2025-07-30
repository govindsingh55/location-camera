

<script lang="ts">
let props = $props();
</script>

<div class="flex min-h-[80vh] flex-col items-center justify-center gap-6 px-4 py-8 w-full">
  <span class="material-symbols-outlined text-6xl text-primary">photo_camera</span>
  <h2 class="text-xl sm:text-2xl font-bold text-center">Camera Permission Required</h2>
  <p class="text-center text-base-content/80 text-base sm:text-lg">To use this app, please allow camera access.</p>
  <button class="btn btn-primary w-full max-w-md" style="min-height:3rem;" onclick={props.onRequestPermission}>Allow Camera Access</button>
</div>
