// src/lib/kintoneUpdateRecords.svelte.js
import { invoke } from "@tauri-apps/api/core";
import { authState } from './appLoginManager.svelte.js';
import { refreshToken } from './kintoneRefreshRequest.js';
import { taskState } from "./appTaskManager.svelte.js";

export async function updateTaskStatus(appId) {
    if (!authState.isAuthenticated || !authState.token) {
        throw new Error('Not authenticated');
    }

    if (taskState.selectedTasks.length === 0) {
        throw new Error('No tasks selected');
    }

    try {
        await invoke("kintone_update_records", {
            appId,
            records: taskState.selectedTasks.map(id => ({
                id: id,
                record: {
                    taskStatus: {
                        value: "completed"
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
            taskState.selectedTasks.includes(task.id)
                ? { ...task, status: "completed" }
                : task
        );
        taskState.selectedTasks = [];

    } catch (error) {
        if (error === "token_expired" && authState.refreshToken) {
            await refreshToken();
            return await updateTaskStatus(appId);
        }
        throw error;
    }
}