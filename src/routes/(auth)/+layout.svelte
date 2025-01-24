<!-- src/routes/(auth)/+layout.svelte -->
<script>
    let { children } = $props();
    import ParticleBackground from '../../components/ParticleBackground.svelte';
    import { initializeUrlListener, cleanupUrlListener } from '../../lib/urlListenerManager.svelte.js';

    $effect.root(() => {
        initializeUrlListener();
        return cleanupUrlListener;
    });
</script>

<main class="min-h-screen">
    <ParticleBackground />
    {@render children?.()}
</main>