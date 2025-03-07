<!-- src/components/TaskDetailsButtons/ViewNotification.svelte -->
<script>
    import { SidebarItem } from "svelte-5-ui-lib";
    import { BellRingOutline } from "flowbite-svelte-icons";
    import { _ } from "svelte-i18n";

    const viewNotification = () => console.log("view notification");
</script>

<SidebarItem
    label={$_("taskDetailsButtons.viewNotification")}
    onclick={viewNotification}
    class="cursor-pointer mb-3"
    activeClass="flex items-center text-base font-normal text-gray-900 rounded-lg border border-ebony-200 p-3 hover:bg-thistle-800 bg-white"
    nonActiveClass="flex items-center text-base font-normal text-gray-900 rounded-lg border border-ebony-200 p-3 hover:bg-thistle-800 bg-white"
>
    {#snippet iconSlot()}
        <BellRingOutline
            class="h-5 w-5 text-ebony-600 transition-colors hover:text-moss_green-600"
        />
    {/snippet}
</SidebarItem>
