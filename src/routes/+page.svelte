<!-- src/routes/+page.svelte -->
<script>
    import { goto } from "$app/navigation";
    import { Spinner } from "svelte-5-ui-lib";
    import { secretManager } from "../requests/appSecretManager";

    $effect(async () => {
        const token = await secretManager.getSecret('kintone_access_token');
        goto(token ? '/home' : '/login');
    });
</script>

<div class="flex items-center justify-center min-h-screen">
    <Spinner />
</div>