<!-- src/components/HomeTaskButtons/SelectAllTasks.svelte -->
<script>
    import { SidebarItem } from "svelte-5-ui-lib";
    import { BadgeCheckOutline, BadgeCheckSolid } from "flowbite-svelte-icons";
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
    activeClass="flex items-center text-base font-normal text-slate-700 font-bold rounded-lg border border-slate-700 p-3 hover:bg-slate-200 bg-white"
    nonActiveClass="flex items-center text-base font-normal text-slate-700 font-bold rounded-lg border border-slate-700 p-3 hover:bg-slate-200 {allCurrentSelected
                ? 'bg-slate-200'
                : 'bg-white'}"
>
    {#snippet iconSlot()}
    {#if allCurrentSelected}
    <BadgeCheckSolid
    class="h-5 w-5 text-ebony-600 transition-colors hover:text-moss_green-600"
/>
    {:else}
    <BadgeCheckOutline
    class="h-5 w-5 text-ebony-600 transition-colors hover:text-moss_green-600"
/>
    {/if}
    {/snippet}
</SidebarItem>