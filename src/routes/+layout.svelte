<!-- src/routes/+layout.svelte -->
<script>
    import "../app.pcss";
    let { children } = $props();
</script>

<div class="min-h-screen">
    {@render children?.()}
</div>
