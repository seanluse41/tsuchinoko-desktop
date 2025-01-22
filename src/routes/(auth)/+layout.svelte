<!-- src/routes/(auth)/+layout.svelte -->
<script>
    let { children } = $props();
</script>

<main class="min-h-screen">
    {@render children?.()}
</main>