// src/lib/kintone/kintoneChangeFolder.svelte.js
import { invoke } from "@tauri-apps/api/core";
import { authState } from '../app/appLoginManager.svelte.js';
import { refreshToken } from './kintoneRefreshRequest.js';
import { taskState } from "../app/appTaskManager.svelte.js";
import { trackTaskAction } from "$lib/app/appNavigationTracker.svelte.js";

export async function changeTaskFolder(appId, taskIds, targetFolder) {
    if (!authState.isAuthenticated || !authState.token) {
        throw new Error('Not authenticated');
    }

    if (taskIds.length === 0) {
        throw new Error('No tasks selected');
    }

    try {
        await invoke("kintone_update_records", {
            appId,
            records: taskIds.map(id => ({
                id: id,
                record: {
                    taskFolder: {
                        value: targetFolder
                    }
                }
            })),
            config: {
                subdomain: authState.user.subdomain,
                domain: authState.user.domain,
                access_token: authState.token
            }
        });

        // Update local state after successful update
        taskState.tasks = taskState.tasks.map(task =>
            taskIds.includes(task.id)
                ? { ...task, folder: targetFolder }
                : task
        );
        
        // Track folder change in navigation log
        trackTaskAction(taskIds, "folder-change");
        
        // Clear selection after folder change
        taskState.selectedTasks = [];

    } catch (error) {
        if (error === "token_expired" && authState.refreshToken) {
            await refreshToken();
            return await changeTaskFolder(appId, taskIds, targetFolder);
        }
        throw error;
    }
}