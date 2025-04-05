// src/lib/kintone/kintoneOverdueTasks.svelte.js
import { invoke } from "@tauri-apps/api/core";
import { authState } from '../app/appLoginManager.svelte.js';
import { refreshToken } from './kintoneRefreshRequest.js';
import { taskState } from "../app/appTaskManager.svelte.js";
import { trackTaskAction } from "$lib/app/appNavigationTracker.svelte.js";
import { sendSingleNotification, sendMultiNotification } from "../os/notificationHandler.svelte.js";


export async function checkForOverdueTasks() {
    if (!authState.isAuthenticated || !authState.token) {
        console.log('Not authenticated, skipping overdue check');
        return { updated: 0 };
    }

    try {
        const now = new Date();
        const overdueTasksData = taskState.tasks
            .filter(task => {
                if (task.status === 'overdue' || task.status === 'completed') {
                    return false;
                }
                                if (!task.dateDue) {
                    return false;
                }
                
                // Check if due date is in the past
                const dueDate = new Date(task.dateDue);
                return !isNaN(dueDate.getTime()) && dueDate < now;
            });
        
        const overdueTaskIds = overdueTasksData.map(task => task.id);
        
        if (overdueTaskIds.length === 0) {
            console.log('No new overdue tasks found');
            return { updated: 0 };
        }
                
        taskState.tasks = taskState.tasks.map(task =>
            overdueTaskIds.includes(task.id)
                ? { ...task, status: "overdue" }
                : task
        );
        
        const recordsToUpdate = overdueTaskIds.map(id => ({
            id: id,
            record: {
                taskStatus: {
                    value: "overdue"
                }
            }
        }));
        
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
        
        // Send notification about overdue tasks
        if (overdueTaskIds.length === 1) {
            const taskData = overdueTasksData[0];
            sendSingleNotification(taskData.id, 'becomeOverdue', taskData);
        } else if (overdueTaskIds.length > 1) {
            sendMultiNotification(overdueTaskIds, 'becomeOverdue', overdueTaskIds.length);
        }
        
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