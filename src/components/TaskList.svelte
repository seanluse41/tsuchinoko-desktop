<!-- src/components/TaskList.svelte -->
<script>
    import TaskItem from "./TaskItem.svelte";
    import Task404Alert from "./Task404Alert.svelte";
    import { taskState } from "../lib/appTaskManager.svelte";

    let alertStatus = $derived(!!taskState.error);
</script>

<div class="flex flex-col flex-grow w-full">
    <Task404Alert {alertStatus} />
    
    {#each taskState.tasks as task}
        <TaskItem {...task} />
    {/each}
</div>