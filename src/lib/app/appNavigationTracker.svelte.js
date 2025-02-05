// src/lib/app/appNavigationTracker.svelte.js
export const navigationState = $state({
    latestTaskId: null,
    latestAction: null, // 'create', 'update', 'delete', 'complete', 'view'.
    navigationStack: [] // Array of {path, timestamp} objects
});

export function trackNavigation(path) {
    const newEntry = {
        path,
        timestamp: new Date().toISOString()
    };
    
    navigationState.navigationStack = [
        newEntry,
        ...navigationState.navigationStack.slice(0, 9)
    ];
}

export function trackTaskAction(taskId, action) {
    navigationState.latestTaskId = taskId;
    navigationState.latestAction = action;
}