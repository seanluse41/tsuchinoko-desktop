<script>
    import tasks from "../data/tasks.json"
    import TaskItem from "./TaskItem.svelte";
</script>

<div class="flex flex-col flex-grow w-full">
    {#each tasks.list as task}
        <TaskItem {...task} />
    {/each}
</div>