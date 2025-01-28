<!-- src/components/HomeTaskButtons/SelectAllTasks.svelte -->
<script>
    import { SidebarItem } from "svelte-5-ui-lib";
    import { BadgeCheckOutline } from "flowbite-svelte-icons";
    import { taskState } from "../../lib/appTaskManager.svelte";

    let selectAllText = $derived(
        taskState.selectedTasks.length === taskState.tasks.length
            ? "Deselect All"
            : "Select All"
    );

    function toggleSelectAll() {
        if (taskState.selectedTasks.length === taskState.tasks.length) {
            taskState.selectedTasks = [];
        } else {
            taskState.selectedTasks = taskState.tasks.map((task) => task.id);
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