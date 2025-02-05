<!-- src/components/HomeTaskButtons/SyncTasks.svelte -->
<script>
    import { SidebarItem } from "svelte-5-ui-lib";
    import { RefreshOutline } from "flowbite-svelte-icons";
    import { loadTasks } from "$lib/app/appTaskManager.svelte";
</script>

<SidebarItem
    label="Sync"
    onclick={loadTasks}
    class="cursor-pointer mb-3"
    activeClass="flex items-center text-base font-normal text-slate-700 font-bold rounded-lg border border-slate-700 p-3 hover:bg-slate-200 bg-white"
    nonActiveClass="flex items-center text-base font-normal text-slate-700 font-bold rounded-lg border border-slate-700 p-3 hover:bg-slate-200 bg-white"
>
    {#snippet iconSlot()}
        <RefreshOutline
            class="h-5 w-5 text-ebony-600 transition-colors hover:text-moss_green-600"
        />
    {/snippet}
</SidebarItem>