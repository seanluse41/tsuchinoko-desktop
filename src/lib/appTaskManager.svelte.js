// src/lib/appTaskManager.svelte.js
import { getRecords } from './kintoneGetRecords.svelte.js';

export const taskState = $state({
    tasks: [],
    selectedTasks: [],
    isLoading: false,
    error: null
});

export async function loadTasks() {
    taskState.isLoading = true;
    taskState.error = null;
    const response = await getRecords("16", "");
    taskState.tasks = response.list;
    taskState.selectedTasks = [];
    taskState.isLoading = false;
}

export function toggleTaskSelection(taskId) {
    const index = taskState.selectedTasks.indexOf(taskId);
    if (index > -1) {
        console.log("unselecting", taskId);
        taskState.selectedTasks = taskState.selectedTasks.filter(id => id !== taskId);
    } else {
        console.log("selecting", taskId);
        taskState.selectedTasks = [...taskState.selectedTasks, taskId];
    }
    console.log("current selected:", taskState.selectedTasks);
}

export function allTasksCompleted(selectedIds, tasks) {
    return selectedIds.every(id => 
        tasks.find(task => task.id === id)?.status === 'completed'
    );
}