<!-- src/components/HomeTaskButtons/SelectAllTasks.svelte -->
<script>
    import { SidebarItem } from "svelte-5-ui-lib";
    import { BadgeCheckOutline } from "flowbite-svelte-icons";
    import { taskState } from "../../lib/appTaskManager.svelte";
    import { getDisplayTasks } from "../../lib/appTaskFilters.svelte.js";

    let displayTasks = $derived(getDisplayTasks());
    let displayTaskIds = $derived(displayTasks.map(task => task.id));
    let allCurrentSelected = $derived(
        displayTaskIds.length > 0 && 
        displayTaskIds.every(id => taskState.selectedTasks.includes(id))
    );

    let selectAllText = $derived(allCurrentSelected ? "Deselect All" : "Select All");

    function toggleSelectAll() {
        if (allCurrentSelected) {
            taskState.selectedTasks = taskState.selectedTasks.filter(
                id => !displayTaskIds.includes(id)
            );
        } else {
            const newSelection = [...new Set([
                ...taskState.selectedTasks,
                ...displayTaskIds
            ])];
            taskState.selectedTasks = newSelection;
        }
    }
</script>

<SidebarItem
    label={selectAllText}
    onclick={toggleSelectAll}
    class="cursor-pointer mb-3"
    activeClass="flex items-center text-base font-normal text-gray-900 rounded-lg border border-ebony-200 p-3 hover:bg-thistle-800 bg-white"
    nonActiveClass="flex items-center text-base font-normal text-gray-900 rounded-lg border border-ebony-200 p-3 hover:bg-thistle-800 bg-white"
>
    {#snippet iconSlot()}
        <BadgeCheckOutline
            class="h-5 w-5 text-ebony-600 transition-colors hover:text-moss_green-600"
        />
    {/snippet}
</SidebarItem>