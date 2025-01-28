<!-- src/components/HomeTaskButtons/FilterTasks.svelte -->
<script>
    import {
        SidebarItem,
        SidebarDropdownWrapper,
    } from "svelte-5-ui-lib";
    import { SearchOutline } from "flowbite-svelte-icons";
    import { setFilter } from "../../lib/appTaskFilters.svelte.js";

    const filterOverdue = () => setFilter("overdue");
    const filterCompleted = () => setFilter("completed");
    const filterRegistered = () => setFilter("registered");
    const filterUnregistered = () => setFilter("unregistered");
</script>

<SidebarDropdownWrapper
    label="Filter"
    btnClass="cursor-pointer mb-3 flex items-center text-base font-normal text-gray-900 rounded-lg border border-ebony-200 p-3 hover:bg-thistle-800 bg-white"
>
    {#snippet iconSlot()}
        <SearchOutline
            class="h-5 w-5 text-ebony-600 transition-colors hover:text-moss_green-600"
        />
    {/snippet}

    <SidebarItem
        label="Overdue Tasks"
        onclick={filterOverdue}
        class="cursor-pointer"
        activeClass="flex items-center text-base font-normal text-gray-900 p-3 hover:bg-white rounded"
        nonActiveClass="flex items-center text-base font-normal text-gray-900 p-3 hover:bg-white rounded"
    />
    <SidebarItem
        label="Completed Tasks"
        onclick={filterCompleted}
        class="cursor-pointer"
        activeClass="flex items-center text-base font-normal text-gray-900 p-3 hover:bg-white rounded"
        nonActiveClass="flex items-center text-base font-normal text-gray-900 p-3 hover:bg-white rounded"
    />
    <SidebarItem
        label="Registered Tasks"
        onclick={filterRegistered}
        class="cursor-pointer"
        activeClass="flex items-center text-base font-normal text-gray-900 p-3 hover:bg-white rounded"
        nonActiveClass="flex items-center text-base font-normal text-gray-900 p-3 hover:bg-white rounded"
    />
    <SidebarItem
        label="Unregistered Tasks"
        onclick={filterUnregistered}
        class="cursor-pointer"
        activeClass="flex items-center text-base font-normal text-gray-900 p-3 hover:bg-white rounded"
        nonActiveClass="flex items-center text-base font-normal text-gray-900 p-3 hover:bg-white rounded"
    />
</SidebarDropdownWrapper>