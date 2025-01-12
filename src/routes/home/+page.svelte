<script>
    import TaskCommands from "../../components/TaskCommands.svelte";
    import TaskList from "../../components/TaskList.svelte";
</script>

<div class="flex flex-row gap-x-2">
    <div class="w-1/4 flex-grow">
        <TaskCommands />
    </div>
    <div class="w-3/4 flex-grow">
        <TaskList />
    </div>
</div>
