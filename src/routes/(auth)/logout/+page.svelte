<!-- src/routes/(auth)/logout/+page.svelte -->
<script>
    import { goto } from "$app/navigation";
    import { secretManager } from "../../../requests/appSecretManager";

    $effect(async () => {
        try {
            await Promise.all([
                secretManager.storeSecret('kintone_access_token', ''),
                secretManager.storeSecret('kintone_state', ''),
                secretManager.storeSecret('kintone_subdomain', '')
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