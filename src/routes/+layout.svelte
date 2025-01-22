<!-- src/routes/+layout.svelte -->
<script>
    import "../app.pcss";
    import { secretManager } from "../requests/appSecretManager";
    
    let { children } = $props();
    
    export const auth = $state({
        isAuthenticated: false,
        token: null,
        subdomain: '',
    });

    $effect(async () => {
        try {
            const storedToken = await secretManager.getSecret('kintone_access_token');
            const storedSubdomain = await secretManager.getSecret('kintone_subdomain');
            
            if (storedToken) {
                auth.token = storedToken;
                auth.isAuthenticated = true;
                auth.subdomain = storedSubdomain;
            }
        } catch (error) {
            console.error('Failed to load auth state:', error);
        }
    });
</script>

<div class="min-h-screen">
    {@render children?.()}
</div>