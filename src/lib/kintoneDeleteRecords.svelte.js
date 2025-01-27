// src/lib/kintoneDeleteRecords.svelte.js
import { invoke } from "@tauri-apps/api/core";
import { authState } from './appLoginManager.svelte.js';
import { refreshToken } from './kintoneRefreshRequest.js';
import { taskState } from "./appTaskManager.svelte.js";

export async function deleteRecords(appId) {
    if (!authState.isAuthenticated || !authState.token) {
        throw new Error('Not authenticated');
    }

    if (taskState.selectedTasks.length === 0) {
        throw new Error('No tasks selected');
    }

    try {
        await invoke("kintone_delete_records", {
            appId,
            ids: taskState.selectedTasks,
            config: {
                subdomain: authState.user.subdomain,
                domain: authState.user.domain,
                access_token: authState.token
            }
        });

        // Update local state after successful deletion
        taskState.tasks = taskState.tasks.filter(task => 
            !taskState.selectedTasks.includes(task.id)
        );
        taskState.selectedTasks = [];
        
    } catch (error) {
        if (error === "token_expired" && authState.refreshToken) {
            await refreshToken();
            return await deleteRecords(appId);
        }
        throw error;
    }
}