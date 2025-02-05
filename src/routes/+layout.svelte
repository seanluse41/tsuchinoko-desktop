<!-- src/routes/+layout.svelte -->
<script>
    import "../app.pcss";
    import { page } from "$app/state";
    import { navigationState, trackNavigation, trackTaskAction } from "$lib/app/appNavigationTracker.svelte.js";

    let { children } = $props();
    let previousPath = $state('');

    $effect(() => {
        const currentPath = page.url.pathname;
        if (currentPath !== previousPath) {
            trackNavigation(currentPath);
            trackTaskAction(null, "browse")
            previousPath = currentPath;
        }
        $inspect(navigationState)
    });
</script>

<div class="min-h-screen">
    {@render children?.()}
</div>
