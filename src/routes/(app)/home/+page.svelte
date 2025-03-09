<!-- src/routes/(app)/home/+page.svelte -->
<script>
  import TaskCommands from "../../../components/TaskCommands.svelte";
  import TaskList from "../../../components/TaskList.svelte";
  import { taskState, loadTasks } from "$lib/app/appTaskManager.svelte";
  import { page } from "$app/state";
  import { authState } from "$lib/app/appLoginManager.svelte.js";
  import { timerState, checkPendingSync, performSync, initializeTimerService } from "$lib/app/appTimerService.svelte.js";

  // Initialize timer service if needed
  initializeTimerService();
  
  $effect(() => {
    // When arriving on home page
    if (authState.isAuthenticated && authState.token) {
      const currentPath = page.url.pathname;
      
      // Check for pending sync or if we need initial load
      if (!taskState.hasLoadedInitially) {
        console.log("Initial load required");
        performSync();
      } else if (currentPath === '/home') {
        checkPendingSync(currentPath);
      }
    }
  });
</script>

<div class="flex h-full">
  <div class="w-64 flex-shrink-0">
    <TaskCommands />
  </div>
  <div class="flex-1 overflow-y-auto">
    {#if taskState.error}
      <div class="flex items-center justify-center w-full h-full">
        <div class="p-4 bg-redwood-100 text-redwood-800 rounded-lg">
          {taskState.error}
        </div>
      </div>
    {:else}
      <div class="p-4">
        <TaskList />
      </div>
    {/if}
  </div>
</div>