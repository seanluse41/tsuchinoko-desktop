<!-- src/routes/(app)/home/+page.svelte -->
<script>
  import { Spinner } from "svelte-5-ui-lib";
  import TaskCommands from "../../../components/TaskCommands.svelte";
  import TaskList from "../../../components/TaskList.svelte";
  import { taskState, loadTasks } from "$lib/app/appTaskManager.svelte";
  import { navigationState } from "$lib/app/appNavigationTracker.svelte";
  import { authState } from "$lib/app/appLoginManager.svelte.js";

  $effect(() => {
    loadTasks();
  });
</script>

{#if taskState.isLoading}
  <div class="flex items-center justify-center w-full h-full">
    <Spinner size="16" color="yellow" />
  </div>
{:else if taskState.error}
  <div class="flex items-center justify-center w-full h-full">
    <div class="p-4 bg-redwood-100 text-redwood-800 rounded-lg">
      {taskState.error}
    </div>
  </div>
{:else}
  <div class="flex h-full">
    <div class="w-64 flex-shrink-0">
      <TaskCommands />
    </div>
    <div class="flex-1 overflow-y-auto">
      <div class="p-4">
        <TaskList />
      </div>
    </div>
  </div>
{/if}