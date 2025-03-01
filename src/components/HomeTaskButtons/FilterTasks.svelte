<!-- src/components/HomeTaskButtons/FilterTasks.svelte -->
<script>
    import { viewState, setFilter } from "$lib/app/appTaskFilters.svelte.js";
    import {
        SidebarDropdownWrapper,
        SidebarItem,
        Indicator,
    } from "svelte-5-ui-lib";
    import { SearchOutline } from "flowbite-svelte-icons";
    import { preferencesState } from "$lib/app/appPreferences.svelte";

    const filterOverdue = () => setFilter("overdue");
    const filterCompleted = () => setFilter("completed");
    const filterRegistered = () => setFilter("registered");
    const filterUnregistered = () => setFilter("unregistered");

    $effect(() => {
        $inspect(viewState);
    });
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
        aClass="flex justify-end"
        activeClass="flex items-center text-base font-normal text-slate-700 p-3 hover:bg-slate-200 rounded"
        nonActiveClass="flex items-center text-base font-normal text-slate-700 p-3 hover:bg-slate-200 rounded"
    >
        {#snippet subtext()}
            {#if viewState.filter == "overdue"}
                <span
                    class="ms-3 h-4 w-4 rounded-full px-2"
                    style="background-color: {preferencesState.overdueTaskColor};"
                ></span>
            {/if}
        {/snippet}
    </SidebarItem>

    <SidebarItem
        label="Completed Tasks"
        onclick={filterCompleted}
        class="cursor-pointer"
        aClass="flex justify-end"
        activeClass="flex items-center text-base font-normal text-slate-700 p-3 hover:bg-slate-200 rounded"
        nonActiveClass="flex items-center text-base font-normal text-slate-700 p-3 hover:bg-slate-200 rounded"
    >
        {#snippet subtext()}
            {#if viewState.filter == "completed"}
                <span
                    class="ms-3 h-4 w-4 rounded-full px-2"
                    style="background-color: {preferencesState.completedTaskColor};"
                ></span>
            {/if}
        {/snippet}
    </SidebarItem>

    <SidebarItem
        label="Registered Tasks"
        onclick={filterRegistered}
        class="cursor-pointer"
        aClass="flex justify-end"
        activeClass="flex items-center text-base font-normal text-slate-700 p-3 hover:bg-slate-200 rounded"
        nonActiveClass="flex items-center text-base font-normal text-slate-700 p-3 hover:bg-slate-200 rounded"
    >
        {#snippet subtext()}
            {#if viewState.filter == "registered"}
                <span
                    class="ms-3 h-4 w-4 rounded-full px-2"
                    style="background-color: {preferencesState.registeredTaskColor};"
                ></span>
            {/if}
        {/snippet}
    </SidebarItem>

    <SidebarItem
        label="Unregistered Tasks"
        onclick={filterUnregistered}
        class="cursor-pointer"
        aClass="flex justify-end"
        activeClass="flex items-center text-base font-normal text-slate-700 p-3 hover:bg-slate-200 rounded"
        nonActiveClass="flex items-center text-base font-normal text-slate-700 p-3 hover:bg-slate-200 rounded"
    >
        {#snippet subtext()}
            {#if viewState.filter == "unregistered"}
                <span
                    class="ms-3 h-4 w-4 rounded-full px-2"
                    style="background-color: {preferencesState.unregisteredTaskColor};"
                ></span>
            {/if}
        {/snippet}
    </SidebarItem>
</SidebarDropdownWrapper>
