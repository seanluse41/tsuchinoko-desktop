// src/lib/kintone/kintoneCheckForApp.svelte.js
import { invoke } from "@tauri-apps/api/core";
import { authState } from '../app/appLoginManager.svelte.js';
import { refreshToken } from './kintoneRefreshRequest.js';
import { secretManager } from '../app/appSecretManager.svelte.js';
import { createTsuuchinokoApp } from './kintoneCreateApp.svelte.js';

// Function to get all apps from Kintone
export async function getAllApps() {
    if (!authState.isAuthenticated || !authState.token) {
        throw new Error('Not authenticated');
    }

    try {
        const response = await invoke("kintone_get_apps", {
            config: {
                subdomain: authState.user.subdomain,
                domain: authState.user.domain,
                access_token: authState.token
            }
        });
        
        console.log("Get apps response:", response);
        return response.apps || [];
        
    } catch (error) {
        if (error === "token_expired" && authState.refreshToken) {
            await refreshToken();
            return await getAllApps();
        }
        console.error("Error getting apps:", error);
        throw error;
    }
}

// Check if the Tsuuchinoko app exists by looking for the specific app name
export async function checkForTsuuchinokoApp() {
    try {
        const apps = await getAllApps();
        console.log("All apps:", apps);
        
        // Look for app with "TSUUCHINOKO - [username]" pattern
        const userName = authState.user.username;
        const expectedAppName = `TSUUCHINOKO - ${userName}`;
        
        const tsuuchinokoApp = apps.find(app => 
            app.name === expectedAppName
        );
        
        if (tsuuchinokoApp) {
            console.log("Found Tsuuchinoko app:", tsuuchinokoApp);
            
            // Store the app ID in auth state
            authState.user.appId = tsuuchinokoApp.appId;
            
            return {
                exists: true,
                appId: tsuuchinokoApp.appId,
                app: tsuuchinokoApp
            };
        }
        
        console.log("Tsuuchinoko app not found, attempting to create one...");
        const createResult = await createTsuuchinokoApp();
        
        if (createResult.success) {
            return {
                exists: true,
                appId: createResult.appId,
                app: {
                    appId: createResult.appId,
                    name: expectedAppName
                },
                created: true
            };
        } else {
            console.error("Failed to create Tsuuchinoko app:", createResult.error);
            return {
                exists: false,
                appId: null,
                app: null,
                error: createResult.error
            };
        }
        
    } catch (error) {
        console.error("Error checking for Tsuuchinoko app:", error);
        throw error;
    }
}

// Function to get the current app ID or throw an error if not found
export function getCurrentAppId() {
    if (!authState.user.appId) {
        throw new Error('No Tsuuchinoko app ID found. Please go to Account Settings to detect your app.');
    }
    return authState.user.appId;
}