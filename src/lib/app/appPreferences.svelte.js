// src/lib/app/appPreferences.svelte.js
import { load } from '@tauri-apps/plugin-store';
import { updateTimerFromPreferences } from './appSyncTimer.svelte.js';

export const preferencesState = $state({
    loggingEnabled: true,
    language: "en",
    compact: false,
    keepFilterOnSearch: true,
    syncTimer: "15",
    completedTaskColor: "#829650",
    registeredTaskColor: "#ffbf00",
    unregisteredTaskColor: "#5f655a",
    overdueTaskColor: "#9d6455",
    menuColor: "#d1c1e9"
});

// File path for the preferences store
const PREFERENCES_STORE_PATH = 'preferences.json';
let storeInstance = null;

async function getStore() {
    if (!storeInstance) {
        // Load or create the store with autoSave disabled
        storeInstance = await load(PREFERENCES_STORE_PATH, { autoSave: false });
    }
    return storeInstance;
}

export async function savePreferences() {
    try {
        const store = await getStore();
        
        // Save all preferences as a single object
        await store.set('preferences', preferencesState);
        
        // Manually save to disk
        await store.save();
        
        // Update timer when preferences are saved
        updateTimerFromPreferences();
        
        console.log('Preferences saved successfully');
    } catch (error) {
        console.error('Failed to save preferences:', error);
    }
}

export async function loadPreferences() {
    try {
        const store = await getStore();
        
        // Get the preferences object
        const savedPrefs = await store.get('preferences');
        
        if (savedPrefs) {
            // Update the preferences state with loaded values
            Object.assign(preferencesState, savedPrefs);
            console.log('Preferences loaded successfully');
        } else {
            console.log('No saved preferences found, using defaults');
            // Save the default preferences
            await savePreferences();
        }
    } catch (error) {
        console.error('Failed to load preferences:', error);
    }
}

export const resetAllPreferences = () => {
    preferencesState.loggingEnabled = true;
    preferencesState.language = "en";
    preferencesState.compact = false;
    preferencesState.keepFilterOnSearch = true;
    preferencesState.syncTimer = "15";
    preferencesState.completedTaskColor = "#829650";
    preferencesState.registeredTaskColor = "#ffbf00";
    preferencesState.overdueTaskColor = "#9d6455";
    preferencesState.unregisteredTaskColor = "#5f655a";
    preferencesState.menuColor = "#d1c1e9";
    
    // Save preferences after resetting
    savePreferences();
}

export const resetColors = () => {
    preferencesState.completedTaskColor = "#829650";
    preferencesState.registeredTaskColor = "#ffbf00";
    preferencesState.overdueTaskColor = "#9d6455";
    preferencesState.menuColor = "#d1c1e9";
    preferencesState.unregisteredTaskColor = "#5f655a";
    
    // Save preferences after resetting colors
    savePreferences();
}

// Function to initialize preferences on app start
export async function initializePreferences() {
    await loadPreferences();
}