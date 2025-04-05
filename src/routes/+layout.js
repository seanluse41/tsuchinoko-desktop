// src/routes/+layout.js
import { secretManager } from '$lib/app/appSecretManager.svelte.js';
import { initializePreferences } from '$lib/app/appPreferences.svelte';
import { preferencesState } from '$lib/app/appPreferences.svelte';
import { browser } from '$app/environment';
import '$lib/i18n';
import { locale, waitLocale } from 'svelte-i18n';
import { onOpenUrl } from '@tauri-apps/plugin-deep-link';
import { goto } from '$app/navigation';
import { trackNavigation } from '$lib/app/appNavigationTracker.svelte';
import { initNotifications } from '$lib/os/notificationHandler.svelte.js';

export const prerender = true;
export const ssr = false;

export async function load() {
    try {
        // First initialize core services
        await secretManager.initialize();
        await initializePreferences();
        // Initialize notifications system
        await initNotifications();
        // Rest of your existing load function...
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

    await onOpenUrl((urls) => {
        console.log('deep link:', urls);
        
        // Get the first URL from the array
        if (!urls || !urls.length) return;
        const url = urls[0];
        
        // Skip OAuth callbacks which are handled elsewhere
        if (url.includes('oauth') || url.includes('tsuuchinoko-auth')) {
            console.log('Skipping OAuth callback URL, handled elsewhere');
            return;
        }
        
        // Extract the path (remove the scheme)
        const path = url.replace('tsuuchinoko://', '');
        
        // Handle empty path as home
        if (!path || path === '') {
            trackNavigation('/home');
            goto('/home');
            return;
        }
        
        // Navigate to the requested path
        const route = `/${path}`;
        console.log(`Navigating to: ${route}`);
        trackNavigation(route);
        goto(route);
    });
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