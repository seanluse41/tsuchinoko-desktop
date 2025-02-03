// src/lib/appFolderManager.svelte.js
import { taskState } from './appTaskManager.svelte.js';

let availableFolders = $derived.by(() => [
    'All',
    ...new Set(taskState.tasks
        .map(task => task.folder)
        .filter(Boolean)
    )
]);

export const folderState = $state({
    selectedFolder: 'All',
    folders: availableFolders
});

export function selectFolder(folderId) {
    folderState.selectedFolder = folderId;
}