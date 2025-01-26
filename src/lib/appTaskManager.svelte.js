// src/lib/appTaskManager.svelte.js
import { getRecords } from './kintoneGetRecords.svelte.js';

export const taskState = $state({
    tasks: [],
    isLoading: false,
    error: null
});

export async function loadTasks() {
    try {
        taskState.isLoading = true;
        taskState.error = null;
        const response = await getRecords("16", "");
        taskState.tasks = response.list;
    } catch (error) {
        taskState.error = error.message;
    } finally {
        taskState.isLoading = false;
    }
}