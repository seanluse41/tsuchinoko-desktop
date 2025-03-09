// src/lib/app/appFolderManager.svelte.js
import { resetFiltersAndSort } from './appTaskFilters.svelte.js';
import { taskState } from './appTaskManager.svelte.js';

export const folderState = $state({
    selectedFolder: 'All',
    folders: ['All']
});

export function selectFolder(folderId) {
    if (folderState.selectedFolder !== folderId) {
        resetFiltersAndSort();
        // Safely check taskState exists and selectedTasks is an array
        if (taskState && Array.isArray(taskState.selectedTasks)) {
            taskState.selectedTasks = [];
        }
        folderState.selectedFolder = folderId;
    }
}