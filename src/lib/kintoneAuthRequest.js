// /src/lib/kintoneAuthRequest.js

import { authState } from './appLoginManager.svelte.js';

export function buildAuthUrl(subdomain, clientId) {
  const state = crypto.randomUUID();
  authState.state = state;

  const authUrl = new URL(`https://${subdomain}.kintone.com/oauth2/authorization`);
  authUrl.searchParams.append("response_type", "code");
  authUrl.searchParams.append("client_id", clientId);
  authUrl.searchParams.append("redirect_uri", "https://seanbase.com/tsuuchinoko-auth");
  authUrl.searchParams.append("state", state);
  authUrl.searchParams.append("scope", "k:app_settings:read k:app_settings:write");
  return authUrl;
}

export function validateState(receivedState) {
  if (receivedState !== authState.state) {
    throw new Error("State mismatch - possible CSRF attack");
  }
  return true;
}