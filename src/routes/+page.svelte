<!-- src/routes/+page.svelte -->

<script>
    import { Spinner } from "svelte-5-ui-lib";
    import { authState } from "../lib/appLoginManager.svelte";
    import { secretManagerState } from "../lib/appSecretManager.svelte";
</script>

{#if authState.isLoading || secretManagerState.isInitializing}
    <div class="min-h-screen flex items-center justify-center">
        <Spinner color="yellow" size="16" />
    </div>
{/if}
