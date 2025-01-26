// src/lib/kintoneAuthRequest.js
import { authState } from './appLoginManager.svelte.js';

export function buildAuthUrl(subdomain, clientId, domain = 'cybozu.com') {
  const state = crypto.randomUUID();
  authState.state = state;

  const authUrl = new URL(`https://${subdomain}.${domain}/oauth2/authorization`);
  const scope = "k:app_record:read k:app_record:write";
  
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", "https://seanbase.com/tsuuchinoko-auth");
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("scope", scope);

  console.log('Full URL:', authUrl.toString());
  return authUrl;
}

export function validateState(receivedState) {
  if (receivedState !== authState.state) {
    throw new Error("State mismatch - possible CSRF attack");
  }
  return true;
}