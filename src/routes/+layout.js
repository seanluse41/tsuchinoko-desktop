// src/routes/+layout.js
import { secretManager } from '$lib/app/appSecretManager.svelte.js';
import { initializePreferences } from '$lib/app/appPreferences.svelte';

export const prerender = true;
export const ssr = false;

export async function load() {
    try {
        await secretManager.initialize();
        await initializePreferences();
    } catch (error) {
        console.error('Failed to initialize secret manager:', error);
    }
}