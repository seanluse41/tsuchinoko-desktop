<!-- src/routes/+page.svelte -->
<script>
    import { Spinner } from "svelte-5-ui-lib";
    import { goto } from "$app/navigation";
    import { authState } from "../lib/appLoginManager.svelte";
    import { secretManagerState } from "../lib/appSecretManager.svelte";

    $effect(() => {
        if (!secretManagerState.isInitializing && !authState.isLoading) {
            if (!authState.isAuthenticated) {
                goto('/login');
            } else {
                goto('/home');
            }
        }
    });
</script>

{#if authState.isLoading || secretManagerState.isInitializing}
    <div class="min-h-screen flex items-center justify-center">
        <Spinner color="yellow" size="16" />
    </div>
{/if}