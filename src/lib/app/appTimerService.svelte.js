// src/lib/app/appTimerService.svelte.js
import { browser } from '$app/environment';
import { loadTasks } from './appTaskManager.svelte';
import { preferencesState } from './appPreferences.svelte';

export const timerState = $state({
    lastSyncTime: Date.now(),
    timeDisplay: "00:00",
    syncDue: false,
    syncPending: false,
    isInitialized: false
});

let intervalId = null;

// Updates the timer display and checks for timeout
function updateTimer() {
    const now = Date.now();
    const syncIntervalMs = parseInt(preferencesState.syncTimer) * 60 * 1000;
    const elapsed = now - timerState.lastSyncTime;
    const remaining = Math.max(0, syncIntervalMs - elapsed);
    
    // Format the time display
    const totalSeconds = Math.floor(remaining / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    timerState.timeDisplay = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Check if time elapsed
    if (remaining <= 0) {
        console.log("Global timer elapsed");
        timerState.syncDue = true;
        timerState.syncPending = true;
    }
}

// Start the global timer service
export function initializeTimerService() {
    if (timerState.isInitialized || !browser) return;
    
    console.log("Initializing global timer service");
    updateTimer(); // Initial update
    
    // Set up interval
    intervalId = setInterval(updateTimer, 1000);
    timerState.isInitialized = true;
    
    // Set up cleanup on page unload
    if (browser) {
        window.addEventListener('beforeunload', () => {
            if (intervalId) clearInterval(intervalId);
        });
    }
}

// Handle sync action (called from components)
export async function performSync() {
    console.log("Performing sync");
    try {
        await loadTasks();
        resetTimer();
        console.log("Sync completed successfully");
    } catch (error) {
        console.error("Sync failed:", error);
    }
}

// Reset the timer
export function resetTimer() {
    timerState.lastSyncTime = Date.now();
    timerState.syncDue = false;
    timerState.syncPending = false;
    updateTimer(); // Update immediately
}

// Check for pending sync and process if on home page
export function checkPendingSync(currentPath) {
    if ((timerState.syncPending || timerState.syncDue) && currentPath === '/home') {
        console.log("Processing pending sync on home page");
        performSync();
        return true;
    }
    return false;
}

// Initialize timer service automatically
if (browser) {
    initializeTimerService();
}