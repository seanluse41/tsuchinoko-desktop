<!-- src/routes/+layout.svelte -->
<script>
    import "../app.pcss";
    import ParticleBackground from "../components/ParticleBackground.svelte";
    let { children } = $props();
</script>

<div class="min-h-screen">
    <ParticleBackground />
    {@render children?.()}
</div>
