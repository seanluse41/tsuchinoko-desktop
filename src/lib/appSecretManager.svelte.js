// src/lib/appSecretManager.svelte.js
import { Client, Stronghold } from '@tauri-apps/plugin-stronghold';
import { appDataDir } from '@tauri-apps/api/path';
import { authState } from './appLoginManager.svelte.js';

const VAULT_PASSWORD = 'tsuuchinoko_vault_2024';
const CLIENT_NAME = 'tsuuchinoko_client';
const SETUP_KEY = 'setup_credentials';
const AUTH_KEY = 'auth_credentials';

export const secretManagerState = $state({
    isInitialized: false,
    isInitializing: false,
    error: null
});

let stronghold = null;
let store = null;

async function insertRecord(key, value) {
    const data = Array.from(new TextEncoder().encode(JSON.stringify(value)));
    await store.insert(key, data);
    await stronghold.save();
}

async function getRecord(key) {
    const data = await store.get(key);
    return JSON.parse(new TextDecoder().decode(new Uint8Array(data)));
}

async function initialize() {
    if (secretManagerState.isInitialized || secretManagerState.isInitializing) return;
    
    try {
        Object.assign(secretManagerState, { isInitializing: true, error: null });
        console.log('Initializing secret manager...');
        
        const vaultPath = `${await appDataDir()}/vault.hold`;
        
        try {
            stronghold = await Stronghold.load(vaultPath, VAULT_PASSWORD);
        } catch {
            stronghold = await Stronghold.create(vaultPath, VAULT_PASSWORD);
        }

        let client;
        try {
            client = await stronghold.loadClient(CLIENT_NAME);
        } catch {
            client = await stronghold.createClient(CLIENT_NAME);
        }

        store = client.getStore();
        
        Object.assign(secretManagerState, { isInitialized: true, isInitializing: false, error: null });
        console.log('Secret manager initialization complete');
        
        await loadStoredCredentials();
    } catch (error) {
        Object.assign(secretManagerState, {
            isInitialized: false,
            isInitializing: false,
            error: error.message
        });
        console.log('Secret manager initialization failed');
        throw error;
    }
}

async function storeCredentials() {
    if (!store || !secretManagerState.isInitialized) {
        await initialize();
    }
    
    const setupCredentials = {
        subdomain: authState.user.subdomain,
        clientId: authState.user.clientId,
        clientSecret: authState.user.clientSecret
    };

    const authCredentials = {
        token: authState.token,
        refreshToken: authState.refreshToken
    };

    await insertRecord(SETUP_KEY, setupCredentials);
    await insertRecord(AUTH_KEY, authCredentials);
}

async function loadStoredCredentials() {
    if (!store || !secretManagerState.isInitialized) {
        await initialize();
    }
    
    try {
        const setupCreds = await getRecord(SETUP_KEY);
        console.log('Found stored setup credentials:');
        console.log(setupCreds)
        const authCreds = await getRecord(AUTH_KEY);
        
        Object.assign(authState, {
            token: authCreds?.token || null,
            refreshToken: authCreds?.refreshToken || null,
            user: {
                subdomain: setupCreds?.subdomain || null,
                clientId: setupCreds?.clientId || null,
                clientSecret: setupCreds?.clientSecret || null
            },
            isAuthenticated: !!authCreds?.token,
            error: null
        });
        console.log('Loading stored credentials...');
    } catch {
        return null;
    }
}

async function clearCredentials() {
    if (!store || !secretManagerState.isInitialized) {
        await initialize();
    }
    
    try {
        // Only remove auth tokens, keep setup credentials
        await store.remove(AUTH_KEY);
        await stronghold.save();
        
        // Keep the existing setup info but clear auth state
        const currentSubdomain = authState.user.subdomain;
        const currentClientId = authState.user.clientId;
        const currentClientSecret = authState.user.clientSecret;
        
        Object.assign(authState, {
            token: null,
            refreshToken: null,
            user: {
                subdomain: currentSubdomain,
                clientId: currentClientId,
                clientSecret: currentClientSecret
            },
            isAuthenticated: false,
            error: null
        });
        console.log('Cleared authentication credentials while preserving setup info');
    } catch (error) {
        Object.assign(secretManagerState, { error: error.message });
        console.log('Failed to clear credentials');
        throw error;
    }
}

export const secretManager = {
    initialize,
    storeCredentials,
    loadStoredCredentials,
    clearCredentials,
    state: secretManagerState
};