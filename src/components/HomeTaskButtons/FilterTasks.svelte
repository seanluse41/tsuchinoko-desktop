<!-- src/components/HomeTaskButtons/FilterTasks.svelte -->
<script>
    import { viewState, setFilter } from "../../lib/appTaskFilters.svelte.js";
    import { SidebarDropdownWrapper, SidebarItem } from "svelte-5-ui-lib";
    import { SearchOutline } from "flowbite-svelte-icons";

    const filterOverdue = () => setFilter("overdue");
    const filterCompleted = () => setFilter("completed");
    const filterRegistered = () => setFilter("registered");
    const filterUnregistered = () => setFilter("unregistered");
</script>

<SidebarDropdownWrapper
    label="Filter"
    btnClass="cursor-pointer mb-3 flex items-center text-base font-bold text-slate-700 rounded-lg border border-slate-700 p-3 hover:bg-slate-200 bg-white"
>
    {#snippet iconSlot()}
        <SearchOutline class="h-5 w-5 text-slate-700 transition-colors" />
    {/snippet}

    <SidebarItem
        label="Overdue Tasks"
        onclick={filterOverdue}
        class="cursor-pointer"
        activeClass="flex items-center text-base font-normal text-slate-700 p-3 hover:bg-slate-200 rounded"
        nonActiveClass="flex items-center text-base font-normal text-slate-700 p-3 hover:bg-slate-200 rounded"
    >
    </SidebarItem>

    <SidebarItem
        label="Completed Tasks"
        onclick={filterCompleted}
        class="cursor-pointer"
        activeClass="flex items-center text-base font-normal text-slate-700 p-3 hover:bg-slate-200 rounded"
        nonActiveClass="flex items-center text-base font-normal text-slate-700 p-3 hover:bg-slate-200 rounded"
    />

    <SidebarItem
        label="Registered Tasks"
        onclick={filterRegistered}
        class="cursor-pointer"
        activeClass="flex items-center text-base font-normal text-slate-700 p-3 hover:bg-slate-200 rounded"
        nonActiveClass="flex items-center text-base font-normal text-slate-700 p-3 hover:bg-slate-200 rounded"
    />

    <SidebarItem
        label="Unregistered Tasks"
        onclick={filterUnregistered}
        class="cursor-pointer"
        activeClass="flex items-center text-base font-normal text-slate-700 p-3 hover:bg-slate-200 rounded"
        nonActiveClass="flex items-center text-base font-normal text-slate-700 p-3 hover:bg-slate-200 rounded"
    />
</SidebarDropdownWrapper>
