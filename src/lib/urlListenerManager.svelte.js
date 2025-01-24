// src/lib/urlListenerManager.svelte.js
import { onOpenUrl } from "@tauri-apps/plugin-deep-link";
import { handleAuthCallback } from "./authCallbackHandler.svelte.js";

let unsubscribe = null;

export async function initializeUrlListener() {
    if (unsubscribe) {
        return;
    }

    try {
        unsubscribe = await onOpenUrl(handleAuthCallback);
    } catch (err) {
        console.error("Failed to initialize URL listener:", err);
        throw new Error("Failed to initialize app. Please restart.");
    }
}

export function cleanupUrlListener() {
    if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
    }
}