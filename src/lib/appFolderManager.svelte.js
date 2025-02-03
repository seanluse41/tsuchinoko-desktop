// src/lib/appFolderManager.svelte.js
import { resetFiltersAndSort } from './appTaskFilters.svelte.js';
import { taskState } from './appTaskManager.svelte.js';

export const folderState = $state({
    selectedFolder: 'All',
    folders: ['All']
});

export function selectFolder(folderId) {
    if (folderState.selectedFolder !== folderId) {
        resetFiltersAndSort();
        taskState.selectedTasks = [];
        folderState.selectedFolder = folderId;
    }
}