<!-- src/components/HomeTaskButtons/SyncTasks.svelte -->
<script>
    import { SidebarItem } from "svelte-5-ui-lib";
    import { RefreshOutline } from "flowbite-svelte-icons";
    import { loadTasks } from "$lib/app/appTaskManager.svelte";
    import { resetSyncTimer, syncTimerState } from "$lib/app/appSyncTimer.svelte.js";
    import { preferencesState } from "$lib/app/appPreferences.svelte";
    import { _ } from "svelte-i18n";
    import { onMount, onDestroy } from "svelte";

    // Local time display state
    let timeDisplay = $state("00:00");
    let previousSeconds = -1;
    let intervalId = null;

    // Function to update the local time display
    function updateTimeDisplay() {
        const now = Date.now();
        const syncIntervalMs = parseInt(syncTimerState.lastSyncTime) + (parseInt(preferencesState.syncTimer) * 60 * 1000);
        const remaining = Math.max(0, syncIntervalMs - now);
        const totalSeconds = Math.floor(remaining / 1000);
        
        // Check if timer just hit zero
        if (previousSeconds > 0 && totalSeconds === 0) {
            console.log("Component timer display reached zero!");
        }
        
        previousSeconds = totalSeconds;
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        timeDisplay = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    // Set up local timer on mount
    onMount(() => {
        console.log("Sync button component mounted - starting display timer");
        // Initial update
        updateTimeDisplay();
        
        // Set up timer that updates every second
        intervalId = setInterval(updateTimeDisplay, 1000);
        
        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    });
    
    // Clean up on destroy
    onDestroy(() => {
        console.log("Sync button component unmounted - stopping display timer");
        if (intervalId) clearInterval(intervalId);
    });

    async function handleSync() {
        console.log("Manual sync requested");
        await loadTasks();
        resetSyncTimer();
        updateTimeDisplay(); // Update immediately after sync
    }
</script>

<SidebarItem
    label={`${$_('homeTaskButtons.sync')} (${timeDisplay})`}
    onclick={handleSync}
    class="cursor-pointer mb-3"
    activeClass="flex items-center text-base font-normal text-slate-700 font-bold rounded-lg border border-slate-700 p-3 hover:bg-slate-200 bg-white"
    nonActiveClass="flex items-center text-base font-normal text-slate-700 font-bold rounded-lg border border-slate-700 p-3 hover:bg-slate-200 bg-white"
>
    {#snippet iconSlot()}
        <RefreshOutline
            class="h-5 w-5 text-ebony-600 transition-colors hover:text-moss_green-600"
        />
    {/snippet}
</SidebarItem>