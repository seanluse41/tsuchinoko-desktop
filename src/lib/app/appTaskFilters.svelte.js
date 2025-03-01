// src/lib/app/appTaskFilters.svelte.js
import { taskState } from './appTaskManager.svelte.js';
import { folderState } from './appFolderManager.svelte.js';

export const viewState = $state({
    filter: null,  // 'overdue', 'completed', 'registered', 'unregistered'
    sortField: null,    // 'created', 'due'  
    sortDirection: null // 'asc', 'desc'
});

const tasksView = $derived.by(() => {
    let result = [...taskState.tasks];
    
    // First, apply folder filtering
    if (folderState.selectedFolder !== 'All') {
        result = result.filter(task => task.folder === folderState.selectedFolder);
    }
    
    // Then apply status filter
    if (viewState.filter) {
        result = result.filter(task => task.status === viewState.filter);
    }
    
    // Finally apply sort
    if (viewState.sortField) {
        const dateField = viewState.sortField === 'created' ? 'dateCreated' : 'dateDue';
        result.sort((a, b) => {
            const dateA = new Date(a[dateField]);
            const dateB = new Date(b[dateField]);
            return viewState.sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
        });
    }
    
    return result;
});

export function getDisplayTasks() {
    return tasksView;
}

export function toggleSort(field) {
    if (viewState.sortField === field) {
        if (viewState.sortDirection === 'asc') {
            viewState.sortDirection = 'desc';
        } else {
            viewState.sortField = null;
            viewState.sortDirection = null;
        }
    } else {
        viewState.sortField = field;
        viewState.sortDirection = 'asc';
    }
}

export function setFilter(filter) {
    const newFilter = viewState.filter === filter ? null : filter;
    if (newFilter !== viewState.filter) {
        taskState.selectedTasks = [];
        viewState.filter = newFilter;
    }
}

export function resetFiltersAndSort() {
    viewState.sortField = null;
    viewState.sortDirection = null;
}