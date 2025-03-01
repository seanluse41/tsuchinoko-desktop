// src/lib/app/authCallbackHandler.svelte.js
import { goto } from "$app/navigation";
import { validateState } from "../kintone/kintoneAuthRequest";
import { exchangeToken } from "../kintone/kintoneAccessRequest";
import { authState } from "./appLoginManager.svelte.js";
import { secretManager } from "./appSecretManager.svelte.js";
import { trackNavigation, trackTaskAction } from "./appNavigationTracker.svelte";
import { checkForTsuuchinokoApp } from "../kintone/kintoneCheckForApp.svelte.js";

export async function handleAuthCallback(url) {
    console.log("Processing auth callback...");
    try {
        const parsedUrl = new URL(url);
        const code = parsedUrl.searchParams.get("code");
        const state = parsedUrl.searchParams.get("state");
        const authError = parsedUrl.searchParams.get("error");

        if (authError) throw new Error(`Authentication error: ${authError}`);
        if (!code) throw new Error("No authorization code received");
        
        validateState(state);
        const tokenResponse = await exchangeToken(code);
        
        // Update auth state with token info, but don't save yet
        Object.assign(authState, {
            token: tokenResponse.access_token,
            refreshToken: tokenResponse.refresh_token,
            isAuthenticated: true,
            error: null,
            isLoading: false
        });

        // After authentication, check for the Tsuuchinoko app
        try {
            console.log("Checking for Tsuuchinoko app after login...");
            const appResult = await checkForTsuuchinokoApp();
            
            if (appResult.exists) {
                console.log(`Found Tsuuchinoko app with ID: ${appResult.appId}`);
                // App ID is already stored by checkForTsuuchinokoApp function
            } else {
                console.log("Tsuuchinoko app not found after login");
                // Note: appId will remain null in authState
            }
        } catch (appError) {
            console.error("Error checking for Tsuuchinoko app after login:", appError);
            // Continue with the login flow even if app detection fails
        }

        // Now save credentials once with all updates (token and possibly app ID)
        await secretManager.storeCredentials();
        console.log("Credentials stored after successful auth");

        trackTaskAction([], "login")
        trackNavigation("/home")       
        goto("/home");
    } catch (err) {
        Object.assign(authState, {
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            error: err.message,
            isLoading: false
        });
        console.error("Authentication error:", err);
    }
}