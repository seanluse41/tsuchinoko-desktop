<!-- src/components/HomeTaskButtons/FilterTasks.svelte -->
<script>
    import { viewState, toggleFilter, isFilterActive } from "$lib/app/appTaskFilters.svelte.js";
    import {
        SidebarDropdownWrapper,
        SidebarItem,
    } from "svelte-5-ui-lib";
    import { SearchOutline } from "flowbite-svelte-icons";
    import { preferencesState } from "$lib/app/appPreferences.svelte";
    import { _ } from "svelte-i18n";

    const filterOverdue = () => toggleFilter("overdue");
    const filterCompleted = () => toggleFilter("completed");
    const filterRegistered = () => toggleFilter("registered");
    const filterUnregistered = () => toggleFilter("unregistered");

    let activeFilterCount = $derived(viewState.activeFilters.length);
</script>

<SidebarDropdownWrapper
    label="{$_('homeTaskButtons.filter')}{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}"
    btnClass="cursor-pointer mb-3 flex items-center text-base font-bold text-slate-700 rounded-lg border border-slate-700 p-3 hover:bg-slate-200 bg-white"
>
    {#snippet iconSlot()}
        <SearchOutline class="h-5 w-5 text-slate-700 transition-colors" />
    {/snippet}

    <SidebarItem
        label={$_('homeTaskButtons.overdueFilter')}
        onclick={filterOverdue}
        class="cursor-pointer"
        aClass="flex justify-end"
        activeClass="flex items-center text-base font-normal text-slate-700 p-3 hover:bg-slate-200 rounded {isFilterActive('overdue') ? 'bg-slate-200' : ''}"
        nonActiveClass="flex items-center text-base font-normal text-slate-700 p-3 hover:bg-slate-200 rounded {isFilterActive('overdue') ? 'bg-slate-200' : ''}"
    >
        {#snippet subtext()}
            {#if isFilterActive("overdue")}
                <span
                    class="ms-3 h-4 w-4 rounded-full px-2"
                    style="background-color: {preferencesState.overdueTaskColor};"
                ></span>
            {/if}
        {/snippet}
    </SidebarItem>

    <SidebarItem
        label={$_('homeTaskButtons.completedFilter')}
        onclick={filterCompleted}
        class="cursor-pointer"
        aClass="flex justify-end"
        activeClass="flex items-center text-base font-normal text-slate-700 p-3 hover:bg-slate-200 rounded {isFilterActive('completed') ? 'bg-slate-200' : ''}"
        nonActiveClass="flex items-center text-base font-normal text-slate-700 p-3 hover:bg-slate-200 rounded {isFilterActive('completed') ? 'bg-slate-200' : ''}"
    >
        {#snippet subtext()}
            {#if isFilterActive("completed")}
                <span
                    class="ms-3 h-4 w-4 rounded-full px-2"
                    style="background-color: {preferencesState.completedTaskColor};"
                ></span>
            {/if}
        {/snippet}
    </SidebarItem>

    <SidebarItem
        label={$_('homeTaskButtons.registeredFilter')}
        onclick={filterRegistered}
        class="cursor-pointer"
        aClass="flex justify-end"
        activeClass="flex items-center text-base font-normal text-slate-700 p-3 hover:bg-slate-200 rounded {isFilterActive('registered') ? 'bg-slate-200' : ''}"
        nonActiveClass="flex items-center text-base font-normal text-slate-700 p-3 hover:bg-slate-200 rounded {isFilterActive('registered') ? 'bg-slate-200' : ''}"
    >
        {#snippet subtext()}
            {#if isFilterActive("registered")}
                <span
                    class="ms-3 h-4 w-4 rounded-full px-2"
                    style="background-color: {preferencesState.registeredTaskColor};"
                ></span>
            {/if}
        {/snippet}
    </SidebarItem>

    <SidebarItem
        label={$_('homeTaskButtons.unregisteredFilter')}
        onclick={filterUnregistered}
        class="cursor-pointer"
        aClass="flex justify-end"
        activeClass="flex items-center text-base font-normal text-slate-700 p-3 hover:bg-slate-200 rounded {isFilterActive('unregistered') ? 'bg-slate-200' : ''}"
        nonActiveClass="flex items-center text-base font-normal text-slate-700 p-3 hover:bg-slate-200 rounded {isFilterActive('unregistered') ? 'bg-slate-200' : ''}"
    >
        {#snippet subtext()}
            {#if isFilterActive("unregistered")}
                <span
                    class="ms-3 h-4 w-4 rounded-full px-2"
                    style="background-color: {preferencesState.unregisteredTaskColor};"
                ></span>
            {/if}
        {/snippet}
    </SidebarItem>
</SidebarDropdownWrapper>