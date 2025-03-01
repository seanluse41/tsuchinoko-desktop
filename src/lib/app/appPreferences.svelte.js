// src/lib/app/appPreferences.svelte.js
export const preferencesState = $state({
    loggingEnabled: true,
    language: "en",
    compact: false,
    syncTimer: "15",
    completedTaskColor: "#829650",
    registeredTaskColor: "#ffbf00",
    unregisteredTaskColor: "#5f655a",
    overdueTaskColor: "#9d6455",
    menuColor: "#d1c1e9"
});

export const resetAllPreferences = () => {
    preferencesState.loggingEnabled = true,
    preferencesState.language = "en",
    preferencesState.compact = false,
    preferencesState.syncTimer = "15",
    preferencesState.completedTaskColor = "#829650",
    preferencesState.registeredTaskColor = "#ffbf00",
    preferencesState.overdueTaskColor = "#9d6455",
    preferencesState.unregisteredTaskColor = "#5f655a",
    preferencesState.menuColor = "#d1c1e9"
}

export const resetColors = () => {
    preferencesState.completedTaskColor = "#829650",
    preferencesState.registeredTaskColor = "#ffbf00",
    preferencesState.overdueTaskColor = "#9d6455",
    preferencesState.menuColor = "#d1c1e9",
    preferencesState.unregisteredTaskColor = "#5f655a"
}