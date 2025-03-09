// src/lib/app/appTaskManager.svelte.js
import { getRecords } from '../kintone/kintoneGetRecords.svelte.js';
import { folderState } from './appFolderManager.svelte.js';
import { checkForTsuuchinokoApp } from '../kintone/kintoneCheckForApp.svelte.js';
import { goto } from "$app/navigation";
import { trackNavigation } from './appNavigationTracker.svelte';
import { authState } from './appLoginManager.svelte.js';

export const taskState = $state({
    tasks: [],
    selectedTasks: [],
    isLoading: false,
    error: null,
    hasLoadedInitially: false
});

export async function loadTasks() {
    taskState.isLoading = true;
    taskState.error = null;

    try {
        // Only check for app if ID is missing
        if (!authState.user.appId) {
            console.log("No app ID found, attempting to detect Tsuuchinoko app...");
            const appResult = await checkForTsuuchinokoApp();

            if (!appResult.exists) {
                taskState.error = "Tsuuchinoko app not found. Please go to Account Settings to set up your app.";
                taskState.isLoading = false;

                setTimeout(() => {
                    trackNavigation("/account");
                    goto("/account");
                }, 2000);

                return;
            }
        }

        try {
            const response = await getRecords("");
            taskState.tasks = response.list;
            taskState.selectedTasks = [];
            taskState.hasLoadedInitially = true;

            // Update available folders
            folderState.folders = ['All', ...new Set(response.list.map(task => task.folder).filter(Boolean))];
        } catch (error) {
            // Check if error indicates app not found/deleted
            if (error.toString().includes("GAIA_APP")) {
                // App deleted? clears id
                console.log("App appears to be deleted, clearing app ID");
                authState.user.appId = null;
                await secretManager.storeCredentials();

                taskState.error = "Tsuuchinoko app not found. It may have been deleted.";
                setTimeout(() => {
                    trackNavigation("/account");
                    goto("/account");
                }, 2000);
            } else {
                // Other error, just throw it
                throw error;
            }
        }
    } catch (error) {
        taskState.error = error instanceof Error ? error.message : String(error);
        console.error("Error loading tasks:", error);
    } finally {
        taskState.isLoading = false;
    }
}

export function toggleTaskSelection(taskId) {
    const index = taskState.selectedTasks.indexOf(taskId);
    if (index > -1) {
        taskState.selectedTasks = taskState.selectedTasks.filter(id => id !== taskId);
    } else {
        taskState.selectedTasks = [...taskState.selectedTasks, taskId];
    }
}

export function allTasksCompleted(selectedIds, tasks) {
    return selectedIds.every(id =>
        tasks.find(task => task.id === id)?.status === 'completed'
    );
}