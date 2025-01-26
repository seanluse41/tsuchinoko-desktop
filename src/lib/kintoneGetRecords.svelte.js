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

        return transformRecords(response.records);
    } catch (error) {
        if (error === "token_expired" && authState.refreshToken) {
            const newTokens = await refreshToken();
            return await getRecords(app_id, query);
        }
        throw error;
    }
}

function transformRecords(records) {
    return {
        list: records.map(record => ({
            name: record.notification_title.value,
            id: record.task_id.value,
            status: record.task_status.value,
            link: `https://${authState.user.subdomain}.${authState.user.domain}/k/${app_id}/show#record=${record.task_id.value}`,
            dateCreated: record.task_creation_date_time.value,
            dateDue: record.task_deadline.value,
            description: record.notification_content.value
        }))
    };
}