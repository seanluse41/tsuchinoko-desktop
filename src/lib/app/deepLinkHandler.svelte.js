import { listen } from '@tauri-apps/api/event';
import { goto } from '$app/navigation';
import { trackNavigation } from './appNavigationTracker.svelte.js';

let unlisten = null;

export async function initializeDeepLinkHandler() {
    if (unlisten) return;
    
    try {
        unlisten = await listen('deep-link', (event) => {
            const url = event.payload;
            console.log('Deep link received in frontend:', url);
            
            // Parse the URL
            if (url.includes('link-extension')) {
                console.log('Navigating to link-extension page');
                trackNavigation('/link-extension');
                goto('/link-extension');
            }
        });
        
        console.log('Deep link handler initialized');
    } catch (err) {
        console.error('Failed to initialize deep link handler:', err);
    }
}

export function cleanupDeepLinkHandler() {
    if (unlisten) {
        unlisten();
        unlisten = null;
    }
}