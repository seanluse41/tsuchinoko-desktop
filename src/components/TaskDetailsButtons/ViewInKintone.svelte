<!-- src/components/TaskDetailsButtons/ViewInKintone.svelte -->
<script>
    import { SidebarItem } from "svelte-5-ui-lib";
    import { LinkOutline } from "flowbite-svelte-icons";
    import { open } from "@tauri-apps/plugin-shell";
    import { authState } from "$lib/app/appLoginManager.svelte";
    import { _ } from "svelte-i18n";

    let { taskId } = $props();
    if (!taskId) throw new Error('taskId prop is required');

    const viewInKintone = async () => {
        const url = `https://${authState.user.subdomain}.${authState.user.domain}/k/${authState.user.appId}/show#record=${taskId}`;
        await open(url);
    };
</script>

<SidebarItem
    label={$_('taskDetailsButtons.viewInKintone')}
    onclick={viewInKintone}
    class="cursor-pointer mb-3"
    activeClass="flex items-center text-base font-normal text-gray-900 rounded-lg border border-ebony-200 p-3 hover:bg-thistle-800 bg-white"
    nonActiveClass="flex items-center text-base font-normal text-gray-900 rounded-lg border border-ebony-200 p-3 hover:bg-thistle-800 bg-white"
>
    {#snippet iconSlot()}
        <LinkOutline class="h-5 w-5 text-ebony-600 transition-colors hover:text-moss_green-600" />
    {/snippet}
</SidebarItem>