// src/lib/app/appLogger.svelte.js
import { info, error } from '@tauri-apps/plugin-log';
import { preferencesState } from './appPreferences.svelte.js';

function shouldLog() {
    return preferencesState.loggingEnabled;
}

export const logger = {
    info: (msg) => shouldLog() && info(msg),
    error: (msg) => shouldLog() && error(msg)
};