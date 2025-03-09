<!-- src/routes/(app)/home/+page.svelte -->
<script>
  import { Spinner } from "svelte-5-ui-lib";
  import TaskCommands from "../../../components/TaskCommands.svelte";
  import TaskList from "../../../components/TaskList.svelte";
  import { taskState, loadTasks } from "$lib/app/appTaskManager.svelte";
  import { navigationState } from "$lib/app/appNavigationTracker.svelte";
  import { authState } from "$lib/app/appLoginManager.svelte.js";
  import { 
    startSyncTimer, 
    isSyncTimerElapsed, 
    resetSyncTimer, 
    checkPendingSync 
  } from "$lib/app/appSyncTimer.svelte.js";

  // Handle initial page load and timer initialization
  $effect(async () => {
    // Only proceed if authenticated
    if (authState.isAuthenticated && authState.token) {
      
      // Check for pending sync or timer elapsed
      const hasPendingSync = await checkPendingSync();
      
      // On first load or if no pending sync was processed but timer elapsed
      if (!taskState.hasLoadedInitially || (!hasPendingSync && isSyncTimerElapsed())) {
        console.log("Loading tasks - initial load or timer elapsed");
        await loadTasks();
        // Start or reset the timer after loading
        resetSyncTimer();
      }
      
      // Initialize timer if this is first load
      if (!taskState.hasLoadedInitially) {
        console.log("Initializing sync timer");
        startSyncTimer();
      }
    }
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