<!-- src/routes/(app)/+layout.svelte -->
<script>
    import NavigationBar from "../../components/NavigationBar.svelte";
    let { children } = $props();
</script>

<div class="flex flex-col h-screen">
    <NavigationBar />
    <main class="flex-1 overflow-hidden">
        {@render children?.()}
    </main>
</div>