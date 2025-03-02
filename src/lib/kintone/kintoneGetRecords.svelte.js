// src/lib/kintone/kintoneGetRecords.svelte.js
import { invoke } from "@tauri-apps/api/core";
import { authState } from '../app/appLoginManager.svelte.js';
import { refreshToken } from './kintoneRefreshRequest.js';
import { taskState } from "../app/appTaskManager.svelte.js";
import { getCurrentAppId } from "./kintoneCheckForApp.svelte.js";

export async function getRecords(query = '') {
    if (!authState.isAuthenticated || !authState.token) {
        throw new Error('Not authenticated');
    }

    try {
        const appId = getCurrentAppId();

        const response = await invoke("kintone_get_records", {
            appId,
            query,
            config: {
                subdomain: authState.user.subdomain,
                domain: authState.user.domain,
                access_token: authState.token
            }
        });
        return transformRecords(response.records, appId);
    } catch (error) {
        if (error === "token_expired" && authState.refreshToken) {
            const newTokens = await refreshToken();
            return await getRecords(query);
        }

        // Convert error to string to handle both string and object errors
        const errorStr = String(error);
        
        // If the error includes the Kintone error response, parse it
        if (errorStr.includes('GAIA_AP01')) {
            taskState.error = "No tasks found";
            return { list: [] };
        }
        
        // Set error message on task state
        taskState.error = error instanceof Error ? error.message : errorStr;
        return { list: [] };
    }
}

function transformRecords(records, appId) {
    return {
        list: records.map(record => ({
            name: record.notificationTitle.value,
            id: record.taskID.value,
            status: record.taskStatus.value,
            link: `https://${authState.user.subdomain}.${authState.user.domain}/k/${appId}/show#record=${record.taskID.value}`,
            dateCreated: record.taskCreationDateTime.value,
            dateDue: record.taskDeadline.value,
            description: record.notificationContent.value,
            memo: record.taskMemo.value,
            completionMemo: record.taskCompletionMemo?.value,
            priority: record.taskPriority.value,
            folder: record.taskFolder.value
        }))
    };
}