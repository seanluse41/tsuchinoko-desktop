// src/lib/appTaskFilters.svelte.js
import { taskState } from './appTaskManager.svelte.js';

// Combined state for filters and sorts
export const viewState = $state({
    filter: null,  // 'overdue', 'completed', 'registered', 'unregistered'
    sortField: null,    // 'created', 'due'  
    sortDirection: null // 'asc', 'desc'
});

// Create the derived state but don't export it directly
const tasksView = $derived.by(() => {
    let result = [...taskState.tasks];
    
    // Apply filter
    if (viewState.filter) {
        result = result.filter(task => task.status === viewState.filter);
    }
    
    // Apply sort
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

// Export a function to get the current view
export function getDisplayTasks() {
    return tasksView;
}

// Helper functions stay the same
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
    viewState.filter = viewState.filter === filter ? null : filter;
}