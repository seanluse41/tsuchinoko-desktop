<!-- src/routes/(auth)/logout/+page.svelte -->
<script>
    import { goto } from "$app/navigation";
    import { secretManager } from "../../../lib/appSecretManager.svelte.js";

    $effect(async () => {
        try {
            await secretManager.clearCredentials();
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