<script>
    import TaskItem from "./TaskItem.svelte";
    import Task404Alert from "./Task404Alert.svelte";
    import { taskState } from "../lib/appTaskManager.svelte";
    import { getDisplayTasks } from "../lib/appTaskFilters.svelte.js";

    let alertStatus = $derived(!!taskState.error);
    let displayTasks = $derived(getDisplayTasks());
</script>

<div class="flex flex-col flex-grow w-full p-8 gap-4">
    <Task404Alert {alertStatus} />
    
    {#each displayTasks as task}
        <TaskItem {...task} />
    {/each}
</div>