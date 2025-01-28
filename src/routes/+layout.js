// src/routes/+layout.js
import { secretManager } from '../lib/appSecretManager.svelte.js';

// prerender is false along with fallback: app.html in svelte config due to the [id] slug route not bieng prerenderable.
export const prerender = true;
export const ssr = false;

export async function load() {
    try {
        await secretManager.initialize();
    } catch (error) {
        console.error('Failed to initialize secret manager:', error);
    }
}