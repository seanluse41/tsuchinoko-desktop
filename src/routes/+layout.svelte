<script>
    import "../app.pcss";
    import NavigationBar from "../components/NavigationBar.svelte";
    let { children } = $props();
</script>

<div class="min-h-screen bg-ebony flex flex-col">
    <NavigationBar />
    <main>
        {@render children?.()}
    </main>
</div>