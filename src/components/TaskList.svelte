<!-- src/components/TaskList.svelte -->
<script>
    import TaskItem from "./TaskItem.svelte";
    import { taskState } from "../lib/appTaskManager.svelte";
</script>

<div class="flex flex-col flex-grow w-full">
    {#if taskState.error}
        <div class="text-redwood-600 p-4">
            Error loading tasks: {taskState.error}
        </div>
    {/if}
    
    {#each taskState.tasks as task}
        <TaskItem {...task} />
    {/each}
</div>