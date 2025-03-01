// src/lib/app/appLoginManager.svelte.js
export const authState = $state({
  isAuthenticated: false,
  isLoading: false,
  error: null,
  token: null,
  refreshToken: null,
  state: null,
  user: {
      subdomain: null,
      domain: 'cybozu.com',
      clientId: null,
      clientSecret: null,
      appId: null
  }
});