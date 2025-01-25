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
    try {
        const data = Array.from(new TextEncoder().encode(JSON.stringify(value)));
        await store.insert(key, data);
        await stronghold.save();
    } catch (error) {
        console.error(`Failed to insert record for key ${key}:`, error);
        throw error;
    }
}

async function getRecord(key) {
    try {
        const data = await store.get(key);
        if (!data || data.length === 0) {
            console.log(`No data found for key: ${key}`);
            return null;
        }
        return JSON.parse(new TextDecoder().decode(new Uint8Array(data)));
    } catch (error) {
        if (error.message?.includes('NoSuchRecord')) {
            console.log(`Record not found for key: ${key}`);
            return null;
        }
        console.error(`Error retrieving record for key ${key}:`, error);
        throw error;
    }
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
            console.log('Creating new stronghold vault');
            stronghold = await Stronghold.create(vaultPath, VAULT_PASSWORD);
        }

        try {
            const client = await stronghold.loadClient(CLIENT_NAME);
            store = client.getStore();
        } catch {
            console.log('Creating new stronghold client');
            const client = await stronghold.createClient(CLIENT_NAME);
            store = client.getStore();
        }
        
        Object.assign(secretManagerState, { isInitialized: true, isInitializing: false, error: null });
        console.log('Secret manager initialization complete');
        
        await loadStoredCredentials();
    } catch (error) {
        Object.assign(secretManagerState, {
            isInitialized: false,
            isInitializing: false,
            error: error.message
        });
        console.error('Secret manager initialization failed:', error);
        throw error;
    }
}

async function loadStoredCredentials() {
    if (!store || !secretManagerState.isInitialized) {
        await initialize();
    }
    
    try {
        const setupCreds = await getRecord(SETUP_KEY);
        const authCreds = await getRecord(AUTH_KEY);
        
        if (!setupCreds && !authCreds) {
            console.log('No stored credentials found');
            return;
        }

        console.log('Found stored credentials:', { 
            hasSetupCreds: !!setupCreds, 
            hasAuthCreds: !!authCreds 
        });
        
        Object.assign(authState, {
            token: authCreds?.token || null,
            refreshToken: authCreds?.refreshToken || null,
            user: {
                subdomain: setupCreds?.subdomain || null,
                domain: setupCreds?.domain || 'kintone.com',
                clientId: setupCreds?.clientId || null,
                clientSecret: setupCreds?.clientSecret || null
            },
            isAuthenticated: !!authCreds?.token,
            error: null
        });
    } catch (error) {
        console.error('Error loading stored credentials:', error);
    }
}

async function storeCredentials() {
    if (!store || !secretManagerState.isInitialized) {
        await initialize();
    }
    
    const setupCredentials = {
        subdomain: authState.user.subdomain,
        domain: authState.user.domain,
        clientId: authState.user.clientId,
        clientSecret: authState.user.clientSecret
    };

    const authCredentials = {
        token: authState.token,
        refreshToken: authState.refreshToken
    };

    await insertRecord(SETUP_KEY, setupCredentials);
    await insertRecord(AUTH_KEY, authCredentials);
    console.log('Credentials stored successfully');
}

async function clearCredentials() {
    if (!store || !secretManagerState.isInitialized) {
        await initialize();
    }
    
    try {
        await store.remove(AUTH_KEY);
        await stronghold.save();
        
        const currentSubdomain = authState.user.subdomain;
        const currentDomain = authState.user.domain;
        const currentClientId = authState.user.clientId;
        const currentClientSecret = authState.user.clientSecret;
        
        Object.assign(authState, {
            token: null,
            refreshToken: null,
            user: {
                subdomain: currentSubdomain,
                domain: currentDomain,
                clientId: currentClientId,
                clientSecret: currentClientSecret
            },
            isAuthenticated: false,
            error: null
        });
        console.log('Auth credentials cleared');
    } catch (error) {
        console.error('Failed to clear credentials:', error);
        Object.assign(secretManagerState, { error: error.message });
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