<!-- src/routes/+layout.svelte -->
<script>
    import "../app.pcss";
    import { page } from "$app/state";
    import { navigationState, trackTaskAction } from "$lib/app/appNavigationTracker.svelte.js";
    import ParticleBackground from "../components/ParticleBackground.svelte";
    
    let { children } = $props();
    let previousPath = $state('');

    $effect(() => {
        $inspect(navigationState)
        $inspect(trackTaskAction)
    });
</script>

<div class="min-h-screen">
    <ParticleBackground />
    {@render children?.()}
</div>