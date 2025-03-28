// src/lib/kintone/kintoneUpdateTask.svelte.js
import { invoke } from "@tauri-apps/api/core";
import { authState } from '../app/appLoginManager.svelte.js';
import { refreshToken } from './kintoneRefreshRequest.js';
import { taskState } from "../app/appTaskManager.svelte.js";
import { trackTaskAction } from "$lib/app/appNavigationTracker.svelte.js";

export async function updateTask(taskIds, fields, actionType = 'update') {
    if (!authState.isAuthenticated || !authState.token) {
        throw new Error('Not authenticated');
    }

    // Convert single ID to array for consistent processing
    const ids = Array.isArray(taskIds) ? taskIds : [taskIds];
    
    if (ids.length === 0) {
        throw new Error('No tasks specified');
    }

    try {
        const kintoneFields = {};
        Object.entries(fields).forEach(([key, value]) => {
            kintoneFields[key] = { value };
        });

        const records = ids.map(id => ({
            id,
            record: kintoneFields
        }));

        await invoke("kintone_update_records", {
            appId: authState.user.appId,
            records,
            config: {
                subdomain: authState.user.subdomain,
                domain: authState.user.domain,
                access_token: authState.token
            }
        });

        // Update local state with mapped field names
        taskState.tasks = taskState.tasks.map(task => {
            if (ids.includes(task.id)) {
                return { 
                    ...task,
                    name: fields.notificationTitle || task.name,
                    status: fields.taskStatus || task.status,
                    dateDue: fields.taskDeadline || task.dateDue,
                    description: fields.notificationContent || task.description,
                    memo: fields.taskMemo || task.memo,
                    priority: fields.taskPriority || task.priority,
                    completionMemo: fields.taskCompletionMemo || task.completionMemo,
                    folder: fields.taskFolder || task.folder
                };
            }
            return task;
        });
        
        // Track the action
        trackTaskAction(ids, actionType);
        
    } catch (error) {
        if (error === "token_expired" && authState.refreshToken) {
            await refreshToken();
            return await updateTask(taskIds, fields, actionType);
        }
        throw error;
    }
}