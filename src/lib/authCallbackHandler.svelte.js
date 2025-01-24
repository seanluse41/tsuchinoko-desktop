// src/lib/authCallbackHandler.svelte.js

import { goto } from "$app/navigation";
import { validateState } from "./kintoneAuthRequest";
import { exchangeToken } from "./kintoneAccessRequest";
import { authState } from "./appLoginManager.svelte.js";

export async function handleAuthCallback(url) {
    try {
        const parsedUrl = new URL(url);
        const code = parsedUrl.searchParams.get("code");
        const state = parsedUrl.searchParams.get("state");
        const authError = parsedUrl.searchParams.get("error");

        if (authError) throw new Error(`Authentication error: ${authError}`);
        if (!code) throw new Error("No authorization code received");
        
        validateState(state);
        const tokenResponse = await exchangeToken(code);
        
        authState.token = tokenResponse.access_token;
        authState.refreshToken = tokenResponse.refresh_token;
        authState.isAuthenticated = true;

        await goto("/home");
    } catch (err) {
        authState.error = err.message;
        authState.token = null;
        authState.isAuthenticated = false;
        console.error("Authentication error:", err);
    } finally {
        authState.isLoading = false;
    }
}