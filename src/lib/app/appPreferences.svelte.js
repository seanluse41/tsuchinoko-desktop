// src/lib/app/appPreferences.svelte.js
export const preferencesState = $state({
    loggingEnabled: true,
    language: "en",
    compact: false,
    syncTimer: "15",
    completedTaskColor: "default",
    registeredTaskColor: "default",
    overdueTaskColor: "default",
    menuColor: "default"
});