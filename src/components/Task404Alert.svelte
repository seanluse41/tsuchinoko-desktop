<!-- src/components/Task404Alert.svelte -->
<script>
    import { Alert, Button } from "svelte-5-ui-lib";
    import { InfoCircleSolid, UserSettingsSolid } from "flowbite-svelte-icons";
    import { goto } from "$app/navigation";
    import { open } from "@tauri-apps/plugin-shell";
    import { trackNavigation } from "$lib/app/appNavigationTracker.svelte";

    let { alertStatus = false } = $props();

    function navigateToSettings() {
        trackNavigation("/account")
        goto("/account");
    }

    function contactHelp() {
        open("https://kintone.dev")
    }
</script>

<Alert
    dismissable
    {alertStatus}
    class="bg-redwood text-white mb-4 !items-start"
>
    {#snippet icon()}
        <InfoCircleSolid class="mt-1 h-5 w-5" />
    {/snippet}
    <p class="text-lg font-medium">Task app not found (GAIA_AP01)</p>
    <p class="mb-4 mt-2 text-sm">
        The task app could not be found. It may have been deleted or you may not
        have access to it.
    </p>
    <div class="flex gap-2">
        <Button size="xs" outline onclick={navigateToSettings}>
            <UserSettingsSolid class="me-2 h-4 w-4" />Check Account Settings
        </Button>
        <Button size="xs" outline onclick={contactHelp}><InfoCircleSolid class="me-2 h-4 w-4" /> Contact Help</Button>
    </div>
</Alert>
