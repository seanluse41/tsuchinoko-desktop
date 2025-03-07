// src/routes/+layout.js
import { secretManager } from '$lib/app/appSecretManager.svelte.js';
import { initializePreferences } from '$lib/app/appPreferences.svelte';
import { preferencesState } from '$lib/app/appPreferences.svelte';
import { browser } from '$app/environment';
import '$lib/i18n';
import { locale, waitLocale } from 'svelte-i18n';

export const prerender = true;
export const ssr = false;

export async function load() {
    try {
        // First initialize core services
        await secretManager.initialize();
        await initializePreferences();
        
        if (browser) {
            // Set locale from preferences if available
            if (preferencesState.language) {
                console.log("preferences language is: ", preferencesState.language)
                locale.set(preferencesState.language);
            } else {
                // If no preference exists, use browser locale and update preferences
                const browserLocale = window.navigator.language.split('-')[0];
                // Only use known locales (currently 'en' or 'ja')
                const validLocale = ['en', 'ja'].includes(browserLocale) ? browserLocale : 'en';
                locale.set(validLocale);
                preferencesState.language = validLocale;
                // This will save the locale to preferences storage
                savePreferences();
            }
        }
        
        await waitLocale();
    } catch (error) {
        console.error('Failed to initialize application:', error);
    }
}

// Helper to save preferences 
async function savePreferences() {
    try {
        const savePreferencesModule = await import('$lib/app/appPreferences.svelte.js');
        await savePreferencesModule.savePreferences();
        console.log("saving preferences?")
    } catch (error) {
        console.error('Failed to save language preference:', error);
    }
}