<!-- src/routes/+page.svelte -->

<script>
    import { goto } from "$app/navigation";
    import { page } from "$app/state";
    import { Spinner } from "svelte-5-ui-lib";
    import { authState } from "../lib/appLoginManager.svelte";
    import { secretManagerState } from "$lib/appSecretManager.svelte";

    $effect(() => {
        const pathname = page.url.pathname;
        const isAuthRoute = ["/login", "/setup"].includes(pathname);
        if (isAuthRoute && authState.token) {
            console.log("you have token, going home");
            goto("/home");
        } else if (!isAuthRoute && !authState.token) {
            console.log("no token, going to login");
            goto("/login");
        }
        authState.isLoading = false;
    });
</script>

{#if authState.isLoading || secretManagerState.isInitializing}
    <div class="min-h-screen flex items-center justify-center">
        <Spinner color="yellow" size="16" />
    </div>
{/if}
