// src/lib/kintoneAccessRequest.js
import { invoke } from "@tauri-apps/api/core";
import { authState } from './appLoginManager.svelte.js';

export async function exchangeToken(code) {
    if (!authState.user.clientId || !authState.user.clientSecret || !authState.user.subdomain || !authState.user.domain) {
        throw new Error('Missing required credentials');
    }

    const config = {
        client_id: authState.user.clientId,
        client_secret: authState.user.clientSecret,
        subdomain: authState.user.subdomain,
        domain: authState.user.domain
    };

    return await invoke("kintone_exchange_token", {
        code,
        redirectUri: "https://seanbase.com/tsuuchinoko-auth",
        config
    });
}