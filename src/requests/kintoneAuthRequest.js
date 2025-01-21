// /src/requests/kintoneAuth.js
export function generateState() {
  const array = new Uint8Array(32);
  window.crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function buildAuthUrl(subdomain, clientId) {
  const authUrl = new URL(`https://${subdomain}.kintone.com/oauth2/authorization`);
  authUrl.searchParams.append("response_type", "code");
  authUrl.searchParams.append("client_id", clientId);
  authUrl.searchParams.append("redirect_uri", "https://seanbase.com/tsuuchinoko-auth");
  authUrl.searchParams.append("state", generateState());
  authUrl.searchParams.append("scope", "k:app_settings:read k:app_settings:write");
  return authUrl;
}