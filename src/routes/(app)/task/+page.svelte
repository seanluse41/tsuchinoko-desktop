<!-- src/routes/(app)/task/+page.svelte -->
<script>
    import { page } from "$app/state";
    import { taskState } from "$lib/app/appTaskManager.svelte";
    import { formatDate, getDueText } from "$lib/app/appDateHelpers.js";
    import TaskDetailsCommands from "../../../components/TaskDetailsCommands.svelte";
    import { trackTaskAction } from "$lib/app/appNavigationTracker.svelte";
    import { Heading, P, Hr } from "svelte-5-ui-lib";
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
            <Heading class="text-5xl font-bold mb-4">{task.name}</Heading>
            <div class="space-y-4 max-w-full">
                <P>ID: {task.id}</P>
                <P>Status: {task.status}</P>
                <P>Created: {formatDate(task.dateCreated)}</P>
                <P>Due: {formatDate(task.dateDue)}</P>
                <P>Due in: {getDueText(task.dateDue)}</P>
                <P class="break-words">
                    Description:
                    {task.description}
                </P>
                <P class="break-words">Memo: {task.memo}</P>
                <Hr />
                {#if task.status === 'completed'}
                    <div class="p-4 bg-moss_green-500 border border-slate-700 rounded-lg mt-4">
                        <Heading class="font-medium text-white">Completion Notes:</Heading>
                        <Hr class="mb-8 mt-4" />
                        <P class="break-words text-white">{task.completionMemo}</P>
                    </div>
                {/if}
            </div>
        </div>
    {:else}
        <div class="p-8">
            <p>Task not found</p>
        </div>
    {/if}
</main>