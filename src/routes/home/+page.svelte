<script>
    import TaskCommands from "../../components/TaskCommands.svelte";
    import TaskList from "../../components/TaskList.svelte";
</script>

<div class="flex flex-row h-full w-full">
    <div class="w-64 flex-shrink-0">
        <TaskCommands />
    </div>
    <div class="w-full overflow-y-auto p-4 max-w-screen">
        <TaskList />
    </div>
</div>