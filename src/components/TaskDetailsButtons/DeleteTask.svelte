<!-- src/components/TaskDetailsButtons/DeleteTask.svelte -->
<script>
    import { SidebarItem } from "svelte-5-ui-lib";
    import { TrashBinOutline } from "flowbite-svelte-icons";
    import { taskState } from "$lib/app/appTaskManager.svelte";

    let { modalUI = undefined } = $props();
if (!modalUI) throw new Error('modalUI prop is required');

    const deleteTask = () => {
        if (taskState.selectedTasks.length > 0) {
            modalUI.toggle();
        }
    };
</script>

<SidebarItem
    label="Delete Selected"
    onclick={taskState.selectedTasks.length > 0 ? deleteTask : undefined}
    class="cursor-pointer mb-3 {taskState.selectedTasks.length === 0
        ? 'opacity-50'
        : ''}"
    activeClass="flex items-center text-base font-normal text-gray-900 rounded-lg border border-ebony-200 p-3 bg-white {taskState
        .selectedTasks.length > 0
        ? 'hover:bg-red-500'
        : 'cursor-not-allowed'}"
    nonActiveClass="flex items-center text-base font-normal text-gray-900 rounded-lg border border-ebony-200 p-3 bg-white {taskState
        .selectedTasks.length > 0
        ? 'hover:bg-red-500'
        : 'cursor-not-allowed'}"
>
    {#snippet iconSlot()}
        <TrashBinOutline
            class="h-5 w-5 text-ebony-600 transition-colors"
        />
    {/snippet}
</SidebarItem>