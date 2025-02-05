<!-- src/components/HomeTaskButtons/CompleteTasks.svelte -->
<script>
    import { SidebarItem } from "svelte-5-ui-lib";
    import { BadgeCheckOutline } from "flowbite-svelte-icons";
    import { taskState, allTasksCompleted } from "$lib/app/appTaskManager.svelte";
    import { updateTaskStatus } from "$lib/kintone/kintoneUpdateRecords.svelte";

    let { modalUI = undefined } = $props();
if (!modalUI) throw new Error('modalUI prop is required');

    const completeTask = () => {
        if (taskState.selectedTasks.length > 0) {
            modalUI.toggle();
        }
    };
</script>

<SidebarItem
    label="Mark Complete"
    onclick={taskState.selectedTasks.length > 0 ? completeTask : undefined}
    class="cursor-pointer mb-3 {taskState.selectedTasks.length === 0
        ? 'opacity-50'
        : ''}"
    activeClass="flex items-center text-base font-normal text-gray-900 rounded-lg border border-ebony-200 p-3 bg-white {taskState
        .selectedTasks.length > 0
        ? 'hover:bg-moss_green-700'
        : 'cursor-not-allowed'}"
    nonActiveClass="flex items-center text-base font-normal text-gray-900 rounded-lg border border-ebony-200 p-3 bg-white {taskState
        .selectedTasks.length > 0
        ? 'hover:bg-moss_green-700'
        : 'cursor-not-allowed'}"
>
    {#snippet iconSlot()}
        <BadgeCheckOutline
            class="h-5 w-5 text-ebony-600 transition-colors"
        />
    {/snippet}
</SidebarItem>