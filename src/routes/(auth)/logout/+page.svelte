<!-- src/routes/(auth)/logout/+page.svelte -->
<script>
    import { goto } from "$app/navigation";
    import { secretManager } from "../../../requests/appSecretManager";

    $effect(async () => {
    try {
        await Promise.all([
            secretManager.remove('kintone_access_token'),
            secretManager.remove('kintone_refresh_token'),
            secretManager.remove('kintone_state'), 
            secretManager.remove('kintone_subdomain'),
            secretManager.remove('kintone_client_id'),
            secretManager.remove('kintone_client_secret')
        ]);
        goto('/login');
    } catch (error) {
        console.error('Logout error:', error);
        goto('/login');
    }
});
</script>

<div class="flex items-center justify-center min-h-screen">
    <p>Logging out...</p>
</div>