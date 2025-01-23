// src/routes/+layout.js
import { secretManager } from '../lib/appSecretManager.svelte.js';

export const prerender = true;
export const ssr = false;

export async function load() {
    try {
        await secretManager.initialize();
    } catch (error) {
        console.error('Failed to initialize secret manager:', error);
    }
}