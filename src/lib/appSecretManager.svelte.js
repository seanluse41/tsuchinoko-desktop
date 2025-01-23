// src/lib/appSecretManager.svelte.js
import { Client, Stronghold } from '@tauri-apps/plugin-stronghold';
import { appDataDir } from '@tauri-apps/api/path';
import { authState } from './appLoginManager.svelte.js';

const VAULT_PASSWORD = 'tsuuchinoko_vault_2024';
const CLIENT_NAME = 'tsuuchinoko_client';

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
        secretManagerState.isInitializing = true;
        secretManagerState.error = null;
        
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
        secretManagerState.isInitialized = true;
        
        await loadStoredCredentials();
    } catch (error) {
        secretManagerState.error = error.message;
        throw error;
    } finally {
        secretManagerState.isInitializing = false;
    }
}

async function storeCredentials() {
    if (!store || !secretManagerState.isInitialized) {
        await initialize();
    }
    if (!store) {
        throw new Error('Store not initialized');
    }
    
    const credentials = {
        token: authState.token,
        refreshToken: authState.refreshToken,
        user: authState.user
    };

    await insertRecord('credentials', credentials);
}

async function loadStoredCredentials() {
    if (!store || !secretManagerState.isInitialized) {
        await initialize();
    }
    if (!store) {
        throw new Error('Store not initialized');
    }
    
    try {
        const credentials = await getRecord('credentials');
        
        authState.token = credentials.token;
        authState.refreshToken = credentials.refreshToken;
        authState.user = credentials.user;
        authState.isAuthenticated = !!credentials.token;
    } catch {
        return null;
    }
}

async function clearCredentials() {
    if (!store || !secretManagerState.isInitialized) {
        await initialize();
    }
    
    if (!store) {
        throw new Error('Store not initialized');
    }
    
    try {
        await store.remove('credentials');
        await stronghold.save();
        
        authState.token = null;
        authState.refreshToken = null;
        authState.user = {
            subdomain: null,
            clientId: null,
            clientSecret: null
        };
        authState.isAuthenticated = false;
    } catch (error) {
        secretManagerState.error = error.message;
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