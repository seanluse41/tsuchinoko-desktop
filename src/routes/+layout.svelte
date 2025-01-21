// +layout.svelte
<script>
    import "../app.pcss";
    import NavigationBar from "../components/NavigationBar.svelte";
    import { onMount } from "svelte";
    import { secretManager } from "../requests/appSecretManager";
    
    let { children } = $props();

    onMount(async () => {
        try {
            // Wait for initialization to complete
            await secretManager.initialize();
            console.log('SecretManager ready');
        } catch (error) {
            console.error('SecretManager initialization failed:', error);
        }
    });
</script>

<div class="bg-ebony-900 flex flex-col h-screen">
    <NavigationBar />
    <main class="flex-1 flex overflow-hidden">
        {@render children?.()}
    </main>
</div>