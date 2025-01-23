<!-- src/routes/+layout.svelte -->
<script>
    import { goto } from "$app/navigation";
    import "../app.pcss";
    import { secretManager } from "../requests/appSecretManager";
    import { page } from "$app/state";
    import { Spinner } from "svelte-5-ui-lib";
    
    let { children } = $props();
    let isLoading = $state(true);

    $effect(async () => {
        try {
            await secretManager.initialize();
            const token = await secretManager.getSecret('kintone_access_token');
            const pathname = page.url.pathname;
            const isAuthRoute = ['/login', '/setup'].includes(pathname);
            
            if (isAuthRoute && token) {
                goto('/home');
            } else if (!isAuthRoute && !token && pathname !== '/') {
                goto('/login');
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            if (!page.url.pathname.startsWith('/login')) {
                goto('/login');
            }
        } finally {
            isLoading = false;
        }
    });
</script>

{#if isLoading}
    <div class="min-h-screen flex items-center justify-center">
        <Spinner />
    </div>
{:else}
    <div class="min-h-screen">
        {@render children?.()}
    </div>
{/if}