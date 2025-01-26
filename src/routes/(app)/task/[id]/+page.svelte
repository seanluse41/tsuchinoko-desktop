<!-- src/routes/(app)/task/[id]/+page.svelte -->
<script>
    import { page } from "$app/state";
    import { taskState } from "$lib/appTaskManager.svelte";
    import TaskDetailsCommands from "../../../../components/TaskDetailsCommands.svelte";
    
    let task = $derived(taskState.tasks.find(t => t.id === page.params.id));
</script>

<div class="flex h-full">
    <div class="w-64 flex-shrink-0">
        <TaskDetailsCommands taskId={task?.id} />
    </div>
    {#if task}
        <div class="flex-1 overflow-y-auto p-8">
            <h1 class="text-2xl font-bold mb-4">{task.name}</h1>
            <div class="space-y-4">
                <p><strong>ID:</strong> {task.id}</p>
                <p><strong>Status:</strong> {task.status}</p>
                <p><strong>Created:</strong> {task.dateCreated}</p>
                <p><strong>Due:</strong> {task.dateDue}</p>
                <p><strong>Description:</strong> {task.description}</p>
            </div>
        </div>
    {:else}
        <div class="p-8">
            <p>Task not found</p>
        </div>
    {/if}
</div>