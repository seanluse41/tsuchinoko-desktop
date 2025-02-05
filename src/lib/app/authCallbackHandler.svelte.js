// src/lib/app/authCallbackHandler.svelte.js
import { goto } from "$app/navigation";
import { validateState } from "../kintone/kintoneAuthRequest";
import { exchangeToken } from "../kintone/kintoneAccessRequest";
import { authState } from "./appLoginManager.svelte.js";
import { secretManager } from "./appSecretManager.svelte.js";
import { trackNavigation, trackTaskAction } from "./appNavigationTracker.svelte";

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
        
        Object.assign(authState, {
            token: tokenResponse.access_token,
            refreshToken: tokenResponse.refresh_token,
            isAuthenticated: true,
            error: null,
            isLoading: false
        });

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