// src/lib/kintone/kintoneGetSpace.svelte.js
import { invoke } from "@tauri-apps/api/core";
import { authState } from '../app/appLoginManager.svelte.js';
import { refreshToken } from './kintoneRefreshRequest.js';

export async function getSpace(spaceId) {
    if (!authState.isAuthenticated || !authState.token) {
        throw new Error('Not authenticated');
    }

    if (!spaceId) {
        throw new Error('Space ID is required');
    }

    try {
        const response = await invoke("kintone_get_space", {
            spaceId: spaceId,
            config: {
                subdomain: authState.user.subdomain,
                domain: authState.user.domain,
                access_token: authState.token
            }
        });

        // Store the default thread ID in auth state for future use
        if (response && response.defaultThread) {
            authState.user.defaultThreadId = response.defaultThread;
        }

        return response;
    } catch (error) {
        if (error === "token_expired" && authState.refreshToken) {
            await refreshToken();
            return await getSpace(spaceId);
        }
        console.error("Error getting space info:", error);
        throw error;
    }
}