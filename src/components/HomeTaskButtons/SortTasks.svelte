<!-- src/components/HomeTaskButtons/SortTasks.svelte -->
<script>
    import {
        SidebarItem,
        SidebarDropdownWrapper,
    } from "svelte-5-ui-lib";
    import { SortOutline } from "flowbite-svelte-icons";
    import { viewState, toggleSort } from "../../lib/appTaskFilters.svelte.js";

    const sortByCreated = () => toggleSort("created");
    const sortByDue = () => toggleSort("due");
    
    let createdSortLabel = $derived(
        `Date Created ${
            viewState.sortField === "created"
                ? viewState.sortDirection === "asc"
                    ? "↑"
                    : "↓"
                : ""
        }`,
    );

    let dueSortLabel = $derived(
        `Due Date ${
            viewState.sortField === "due"
                ? viewState.sortDirection === "asc"
                    ? "↑"
                    : "↓"
                : ""
        }`,
    );
</script>

<SidebarDropdownWrapper
    label="Sort"
    btnClass="cursor-pointer mb-3 flex items-center text-base font-normal text-gray-900 rounded-lg border border-ebony-200 p-3 hover:bg-thistle-800 bg-white"
>
    {#snippet iconSlot()}
        <SortOutline
            class="h-5 w-5 text-ebony-600 transition-colors hover:text-moss_green-600"
        />
    {/snippet}
    
    <SidebarItem
        label={createdSortLabel}
        onclick={sortByCreated}
        class="cursor-pointer"
        activeClass="flex items-center text-base font-normal text-gray-900 p-3 hover:bg-white rounded"
        nonActiveClass="flex items-center text-base font-normal text-gray-900 p-3 hover:bg-white rounded"
    />

    <SidebarItem
        label={dueSortLabel}
        onclick={sortByDue}
        class="cursor-pointer"
        activeClass="flex items-center text-base font-normal text-gray-900 p-3 hover:bg-white rounded"
        nonActiveClass="flex items-center text-base font-normal text-gray-900 p-3 hover:bg-white rounded"
    />
</SidebarDropdownWrapper>