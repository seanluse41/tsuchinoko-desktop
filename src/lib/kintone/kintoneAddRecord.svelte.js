// src/lib/kintone/kintoneAddRecord.svelte.js
import { invoke } from "@tauri-apps/api/core";
import { authState } from '../app//appLoginManager.svelte.js';
import { refreshToken } from './kintoneRefreshRequest.js';
import { trackTaskAction } from "$lib/app/appNavigationTracker.svelte.js";
import { taskState } from "$lib/app/appTaskManager.svelte.js";

function formatDateTime(dateString) {
    if (!dateString) return "";
    // Ensure we have a valid date string
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    // Format to ISO string and ensure it ends with Z for UTC
    return date.toISOString();
}

export async function addRecord(formData) {
    if (!authState.isAuthenticated || !authState.token) {
        throw new Error('Not authenticated');
    }

    const now = new Date().toISOString();

    try {
        const record = {
            notificationTitle: {
                value: formData.notificationTitle
            },
            notificationContent: {
                value: formData.notificationContent
            },
            taskPriority: {
                value: formData.taskPriority
            },
            taskDeadline: {
                value: formatDateTime(formData.taskDeadline)
            },
            taskStatus: {
                value: formData.taskStatus
            },
            taskMemo: {
                value: formData.taskMemo
            },
            notificationDateTime: {
                value: ""
            },
            notificationSubtitle: {
                value: ""
            },
            taskCreationDateTime: {
                value: now
            }
        };

        const response = await invoke("kintone_add_record", {
            appId: authState.user.appId,
            record,
            config: {
                subdomain: authState.user.subdomain,
                domain: authState.user.domain,
                access_token: authState.token
            }
        });

        console.log(response);
        trackTaskAction([response.id], "create");
        
        // Add the new task to local state
        const newTask = {
            id: response.id,
            name: formData.notificationTitle,
            status: formData.taskStatus,
            description: formData.notificationContent,
            memo: formData.taskMemo,
            dateCreated: now,
            dateDue: formatDateTime(formData.taskDeadline),
            priority: formData.taskPriority,
            folder: "",
            link: `https://${authState.user.subdomain}.${authState.user.domain}/k/${authState.user.appId}/show#record=${response.id}`,
            completionMemo: ""
        };
        
        // Update the tasks array with the new task
        taskState.tasks = [newTask, ...taskState.tasks];
        
        return response;

    } catch (error) {
        if (error === "token_expired" && authState.refreshToken) {
            await refreshToken();
            return await addRecord(formData);
        }
        throw error;
    }
}