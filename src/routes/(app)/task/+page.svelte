<!-- src/routes/(app)/task/+page.svelte -->
<script>
    import { page } from "$app/state";
    import { taskState } from "$lib/app/appTaskManager.svelte";
    import { formatDate, getDueText } from "$lib/app/appDateHelpers.js";
    import TaskDetailsCommands from "../../../components/TaskDetailsCommands.svelte";
    import { trackTaskAction } from "$lib/app/appNavigationTracker.svelte";
    // Get taskId from query parameter instead of route param
    let taskId = $derived(page.url.searchParams.get("id"));

    $effect(() => {  
    if (taskId) {
        taskState.selectedTasks = [taskId];
    }
    trackTaskAction([taskId], "view")
});

    let task = $derived(taskState.tasks.find((t) => t.id === taskId));
</script>

<main class="flex h-full select-enabled">
    <div class="w-64 flex-shrink-0">
        <TaskDetailsCommands taskId={task?.id} />
    </div>
    {#if task}
        <div class="flex-1 overflow-y-auto p-8 z-10">
            <h1 class="text-5xl font-bold mb-4">{task.name}</h1>
            <div class="space-y-4 max-w-full">
                <p><strong>ID:</strong> {task.id}</p>
                <p><strong>Status:</strong> {task.status}</p>
                <p><strong>Created:</strong> {formatDate(task.dateCreated)}</p>
                <p><strong>Due:</strong> {formatDate(task.dateDue)}</p>
                <p><strong>Due in:</strong> {getDueText(task.dateDue)}</p>
                <p class="break-words">
                    <strong>Description:</strong>
                    {task.description}
                </p>
                <p class="break-words"><strong>Memo:</strong> {task.memo}</p>
            </div>
        </div>
    {:else}
        <div class="p-8">
            <p>Task not found</p>
        </div>
    {/if}
</main>
