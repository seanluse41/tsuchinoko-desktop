<!-- src/routes/(auth)/+layout.svelte -->
<script>
    let { children } = $props();
    import { initializeUrlListener, cleanupUrlListener } from '$lib/app/urlListenerManager.svelte.js';

    $effect.root(() => {
        initializeUrlListener();
        return cleanupUrlListener;
    });
</script>

<main class="min-h-screen">
    {@render children?.()}
</main>