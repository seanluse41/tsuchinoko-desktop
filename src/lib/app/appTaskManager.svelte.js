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
    error: null
});

export async function loadTasks() {
    taskState.isLoading = true;
    taskState.error = null;
    
    try {
        // If we don't have an appId, try to detect the Tsuuchinoko app first
        if (!authState.user.appId) {
            console.log("No app ID found, attempting to detect Tsuuchinoko app...");
            const appResult = await checkForTsuuchinokoApp();
            
            if (!appResult.exists) {
                // App not found, we need to handle this case
                taskState.error = "Tsuuchinoko app not found. Please go to Account Settings to set up your app.";
                taskState.isLoading = false;
                
                // Wait a short time before redirecting to the account page
                setTimeout(() => {
                    trackNavigation("/account");
                    goto("/account");
                }, 2000);
                
                return;
            }
        }
        
        // Now we should have an app ID, proceed with loading tasks
        const response = await getRecords("");
        taskState.tasks = response.list;
        taskState.selectedTasks = [];
        
        // Update available folders
        folderState.folders = ['All', ...new Set(response.list.map(task => task.folder).filter(Boolean))];
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