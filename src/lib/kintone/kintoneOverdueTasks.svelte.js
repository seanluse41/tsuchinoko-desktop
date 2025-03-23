// src/lib/kintone/kintoneOverdueTasks.svelte.js
import { invoke } from "@tauri-apps/api/core";
import { authState } from '../app/appLoginManager.svelte.js';
import { refreshToken } from './kintoneRefreshRequest.js';
import { taskState } from "../app/appTaskManager.svelte.js";
import { trackTaskAction } from "$lib/app/appNavigationTracker.svelte.js";

/**
 * Checks for tasks that are past their due date but not marked as overdue
 * and updates their status to "overdue" in Kintone
 */
export async function checkForOverdueTasks() {
    if (!authState.isAuthenticated || !authState.token) {
        console.log('Not authenticated, skipping overdue check');
        return { updated: 0 };
    }

    try {
        // Find tasks that are past due but not marked as overdue or completed
        const now = new Date();
        const overdueTaskIds = taskState.tasks
            .filter(task => {
                // Skip tasks that are already overdue or completed
                if (task.status === 'overdue' || task.status === 'completed') {
                    return false;
                }
                
                // Check if task has a due date
                if (!task.dateDue) {
                    return false;
                }
                
                // Check if due date is in the past
                const dueDate = new Date(task.dateDue);
                return !isNaN(dueDate.getTime()) && dueDate < now;
            })
            .map(task => task.id);
        
        // If no overdue tasks, return early
        if (overdueTaskIds.length === 0) {
            console.log('No new overdue tasks found');
            return { updated: 0 };
        }
        
        console.log(`Found ${overdueTaskIds.length} tasks that are now overdue`);
        
        // Update local state first
        taskState.tasks = taskState.tasks.map(task =>
            overdueTaskIds.includes(task.id)
                ? { ...task, status: "overdue" }
                : task
        );
        
        // Prepare records for update in Kintone
        const recordsToUpdate = overdueTaskIds.map(id => ({
            id: id,
            record: {
                taskStatus: {
                    value: "overdue"
                }
            }
        }));
        
        // Update the tasks in Kintone
        await invoke("kintone_update_records", {
            appId: authState.user.appId,
            records: recordsToUpdate,
            config: {
                subdomain: authState.user.subdomain,
                domain: authState.user.domain,
                access_token: authState.token
            }
        });
        
        // Track the action
        trackTaskAction(overdueTaskIds, "overdue-update");
        
        return { updated: overdueTaskIds.length };
    } catch (error) {
        if (error === "token_expired" && authState.refreshToken) {
            await refreshToken();
            return await checkForOverdueTasks();
        }
        console.error("Error checking for overdue tasks:", error);
        throw error;
    }
}