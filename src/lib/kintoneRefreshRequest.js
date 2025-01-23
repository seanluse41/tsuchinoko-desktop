// /src/lib/kintoneRefreshRequest.js

import { invoke } from "@tauri-apps/api/core";
import { authState } from './appLoginManager.svelte.js';

export async function refreshToken() {
  try {
    const config = {
      client_id: authState.user.clientId, 
      client_secret: authState.user.clientSecret,
      subdomain: authState.user.subdomain
    };

    if (!authState.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await invoke("kintone_refresh_token", {
      refreshToken: authState.refreshToken,
      config
    });

    authState.token = response.access_token;
    if (response.refresh_token) {
      authState.refreshToken = response.refresh_token;
    }
    
    return response;
  } catch (error) {
    console.error('Token refresh failed:', error);
    throw error;
  }
}