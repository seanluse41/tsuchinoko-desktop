// src/lib/kintoneGetRecords.svelte.js
import { invoke } from "@tauri-apps/api/core";
import { authState } from './appLoginManager.svelte.js';
import { refreshToken } from './kintoneRefreshRequest.js';

export async function getRecords(appId, query = '') {
    if (!authState.isAuthenticated || !authState.token) {
        throw new Error('Not authenticated');
    }
    try {
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
            return await getRecords(appId, query);
        }
        throw error;
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
            description: record.notificationContent.value
        }))
    };
}