// src/lib/appTaskManager.svelte.js
import { getRecords } from './kintoneGetRecords.svelte.js';
import { folderState } from './appFolderManager.svelte.js';

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
    
    // Update available folders
    folderState.folders = ['All', ...new Set(response.list.map(task => task.folder).filter(Boolean))];
    
    taskState.isLoading = false;
}

export function toggleTaskSelection(taskId) {
    const index = taskState.selectedTasks.indexOf(taskId);
    if (index > -1) {
        taskState.selectedTasks = taskState.selectedTasks.filter(id => id !== taskId);
    } else {
        taskState.selectedTasks = [...taskState.selectedTasks, taskId];
    }
}

export function allTasksCompleted(selectedIds, tasks) {
    return selectedIds.every(id => 
        tasks.find(task => task.id === id)?.status === 'completed'
    );
}