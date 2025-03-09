// src/lib/app/appSyncTimer.svelte.js
import { preferencesState } from './appPreferences.svelte';
import { loadTasks } from './appTaskManager.svelte';
import { page } from '$app/state';

export const syncTimerState = $state({
    lastSyncTime: Date.now(),
    intervalId: null,
    syncDue: false,       // Flag indicating sync is due
    syncPending: false,   // Flag indicating sync is pending but hasn't happened yet
    remainingTime: 0,     // in seconds
    timerLabel: "00:00",  // Formatted time string MM:SS
});

// Check if timer has elapsed
export function isSyncTimerElapsed() {
    const now = Date.now();
    const syncIntervalMs = parseInt(preferencesState.syncTimer) * 60 * 1000;
    const elapsed = now - syncTimerState.lastSyncTime;
    return elapsed >= syncIntervalMs;
}

// Calculate remaining time in seconds and update the timer label
function updateRemainingTime() {
    const now = Date.now();
    const syncIntervalMs = parseInt(preferencesState.syncTimer) * 60 * 1000;
    const elapsed = now - syncTimerState.lastSyncTime;
    const remaining = Math.max(0, syncIntervalMs - elapsed);
    const previousRemaining = syncTimerState.remainingTime;
    
    syncTimerState.remainingTime = Math.floor(remaining / 1000);
    syncTimerState.syncDue = remaining <= 0;
    
    // Update the formatted time label
    const totalSeconds = syncTimerState.remainingTime;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    syncTimerState.timerLabel = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Timer transitions to zero - handle it based on current page
    if (previousRemaining > 0 && syncTimerState.remainingTime === 0) {
        const currentPage = page.url.pathname;
        console.log("Global timer timeout detected while on page:", currentPage);
        
        if (currentPage === '/home') {
            console.log("On home page - syncing tasks immediately");
            handleTimerSync();
        } else {
            console.log("Not on home page - marking sync as pending for next home page visit");
            syncTimerState.syncPending = true;
        }
    }
}

// Start the timer
export function startSyncTimer() {
    // Clear any existing timer
    if (syncTimerState.intervalId) {
        clearInterval(syncTimerState.intervalId);
    }
    
    // Reset last sync time
    syncTimerState.lastSyncTime = Date.now();
    syncTimerState.syncPending = false;
    
    // Update time immediately to show correct initial value
    updateRemainingTime();
    
    console.log("Global sync timer started with interval:", preferencesState.syncTimer, "minutes");
    
    // Start a new timer that updates every second
    syncTimerState.intervalId = setInterval(() => {
        updateRemainingTime();
    }, 1000);
}

// Reset the timer (called after sync)
export function resetSyncTimer() {
    syncTimerState.lastSyncTime = Date.now();
    syncTimerState.syncDue = false;
    syncTimerState.syncPending = false;
    updateRemainingTime();
    console.log("Sync timer reset - next sync in", preferencesState.syncTimer, "minutes");
}

// Check and handle pending sync if needed
export async function checkPendingSync() {
    if (syncTimerState.syncPending || syncTimerState.syncDue) {
        console.log("Executing pending task sync after returning to home page");
        await handleTimerSync();
        return true;
    }
    return false;
}

// Handle sync due to timer
async function handleTimerSync() {
    console.log("Executing automatic task sync");
    try {
        await loadTasks();
        console.log("Automatic task sync completed successfully");
    } catch (error) {
        console.error("Automatic task sync failed:", error);
    } finally {
        resetSyncTimer();
    }
}

// Stop the timer
export function stopSyncTimer() {
    if (syncTimerState.intervalId) {
        clearInterval(syncTimerState.intervalId);
        syncTimerState.intervalId = null;
        console.log("Global sync timer stopped");
    }
}

// Update timer when preferences change
export function updateTimerFromPreferences() {
    if (syncTimerState.intervalId) {
        console.log("Timer interval updated from preferences - new interval:", preferencesState.syncTimer, "minutes");
        // If we already have a timer, just reset it with the new interval
        resetSyncTimer();
    }
}