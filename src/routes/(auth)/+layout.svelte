<!-- src/routes/(auth)/+layout.svelte -->
<script>
    let { children } = $props();
    import ParticleBackground from '../../components/ParticleBackground.svelte';
</script>

<main class="min-h-screen">
    <ParticleBackground />
    {@render children?.()}
</main>