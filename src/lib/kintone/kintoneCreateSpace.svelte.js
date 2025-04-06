// src/lib/kintone/kintoneCreateSpace.svelte.js
import { invoke } from "@tauri-apps/api/core";
import { authState } from '../app/appLoginManager.svelte.js';
import { refreshToken } from './kintoneRefreshRequest.js';

// unused, as this requires basic auth which is dumb.

export async function createSpace(spaceName) {
    if (!authState.isAuthenticated || !authState.token) {
        console.log('Not authenticated, cannot create space');
        return { success: false };
    }

    try {
        console.log(`Attempting to create space: ${spaceName}`);
        
        const response = await invoke("kintone_create_space", {
            spaceName,
            config: {
                subdomain: authState.user.subdomain,
                domain: authState.user.domain,
                access_token: authState.token
            }
        });

        console.log('Space created successfully:', response);
        
        return {
            success: true,
            spaceId: response.id
        };
    } catch (error) {
        console.error('Error creating space:', error);
        
        // Check for token expiration
        if (error === "token_expired" && authState.refreshToken) {
            try {
                await refreshToken();
                // Retry with new token
                return createSpace(spaceName);
            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
                return { success: false };
            }
        }
        
        return { success: false };
    }
}