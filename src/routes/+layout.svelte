<script>
    import "../app.pcss";
    import NavigationBar from "../components/NavigationBar.svelte";
    let { children } = $props();
</script>

<div class="bg-ebony-900 flex flex-col h-screen">
    <NavigationBar />
    <main class="flex-1 flex overflow-hidden">
        {@render children?.()}
    </main>
</div>