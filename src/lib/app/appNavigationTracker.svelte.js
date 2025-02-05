// src/lib/app/appNavigationTracker.svelte.js

import { goto } from "$app/navigation";

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

export function trackTaskAction(taskIds, action) {
    navigationState.latestTaskId = taskIds;
    navigationState.latestAction = action;
}

export function appNavigation(path) {
    trackNavigation(path)
    goto(path)
}