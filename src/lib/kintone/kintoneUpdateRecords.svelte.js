// src/lib/kintone/kintoneUpdateRecords.svelte.js
import { invoke } from "@tauri-apps/api/core";
import { authState } from '../app/appLoginManager.svelte.js';
import { refreshToken } from './kintoneRefreshRequest.js';
import { taskState } from "../app/appTaskManager.svelte.js";
import { trackTaskAction } from "$lib/app/appNavigationTracker.svelte.js";

export async function updateTaskStatus(completionMemo = '') {
    if (!authState.isAuthenticated || !authState.token) {
        throw new Error('Not authenticated');
    }

    if (taskState.selectedTasks.length === 0) {
        throw new Error('No tasks selected');
    }

    try {
        await invoke("kintone_update_records", {
            appId: authState.user.appId,
            records: taskState.selectedTasks.map(id => ({
                id: id,
                record: {
                    taskStatus: {
                        value: "completed"
                    },
                    taskCompletionMemo: {
                        value: completionMemo || ""
                    }
                }
            })),
            config: {
                subdomain: authState.user.subdomain,
                domain: authState.user.domain,
                access_token: authState.token
            }
        });

        // Update local state
        taskState.tasks = taskState.tasks.map(task =>
            taskState.selectedTasks.includes(task.id)
                ? { 
                    ...task, 
                    status: "completed",
                    completionMemo: completionMemo || ""
                }
                : task
        );
        trackTaskAction(taskState.selectedTasks, "update");
        taskState.selectedTasks = [];

    } catch (error) {
        if (error === "token_expired" && authState.refreshToken) {
            await refreshToken();
            return await updateTaskStatus(completionMemo);
        }
        throw error;
    }
}