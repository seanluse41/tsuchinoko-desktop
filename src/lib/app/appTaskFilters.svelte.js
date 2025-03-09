// src/lib/app/appTaskFilters.svelte.js
import { taskState } from './appTaskManager.svelte.js';
import { folderState } from './appFolderManager.svelte.js';

export const viewState = $state({
    activeFilters: [],  // Array of active filters: ['overdue', 'completed', 'registered', 'unregistered']
    sortField: null,    // 'created', 'due'  
    sortDirection: null // 'asc', 'desc'
});

const tasksView = $derived.by(() => {
    let result = [...taskState.tasks];
    
    const uniqueStatuses = [...new Set(result.map(task => task.status))];
    
    // First, apply folder filtering
    if (folderState.selectedFolder !== 'All') {
        result = result.filter(task => task.folder === folderState.selectedFolder);
    }
    
    // Then apply status filters (if any are active)
    if (viewState.activeFilters.length > 0) {
        // Only keep tasks whose status is in the activeFilters array
        result = result.filter(task => {
            const matches = viewState.activeFilters.includes(task.status);
            return matches;
        });
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

export function toggleFilter(filter) {
  
    if (viewState.activeFilters.includes(filter)) {
        // Remove the filter if it's already active
        viewState.activeFilters = viewState.activeFilters.filter(f => f !== filter);
    } else {
        // Add the filter if it's not already active
        viewState.activeFilters = [...viewState.activeFilters, filter];
    }
   
    // Clear selection when filters change
    taskState.selectedTasks = [];
}

export function isFilterActive(filter) {
    return viewState.activeFilters.includes(filter);
}

export function resetFiltersAndSort() {
    viewState.activeFilters = [];
    viewState.sortField = null;
    viewState.sortDirection = null;
}