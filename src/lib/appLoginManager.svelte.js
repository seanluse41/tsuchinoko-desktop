// src/lib/appLoginManager.svelte.js

export const authState = $state({
    isAuthenticated: false,
    isLoading: false,
    error: null,
    token: null,
    refreshToken: null,
    user: {
      subdomain: null,
      clientId: null,
      clientSecret: null
    }
  });