// appSecretManager.js
import { Client, Stronghold } from '@tauri-apps/plugin-stronghold';
import { appDataDir } from '@tauri-apps/api/path';

const VAULT_PASSWORD = 'tsuuchinoko_vault_2024';
const CLIENT_NAME = 'tsuuchinoko_client';

class SecretManager {
    constructor() {
        this.initPromise = null;
        this.isReady = false;
    }

    async initialize() {
        if (!this.initPromise) {
            this.initPromise = this._initialize();
            try {
                await this.initPromise;
                this.isReady = true;
                console.log('SecretManager initialization complete');
            } catch (error) {
                this.initPromise = null;
                this.isReady = false;
                throw error;
            }
        }
        return this.initPromise;
    }

    async _initialize() {
        try {
            const vaultPath = `${await appDataDir()}/vault.hold`;
            this.stronghold = await Stronghold.load(vaultPath, VAULT_PASSWORD);
            
            try {
                this.client = await this.stronghold.loadClient(CLIENT_NAME);
            } catch {
                this.client = await this.stronghold.createClient(CLIENT_NAME);
            }
            
            this.store = this.client.getStore();
            return this.store;
        } catch (error) {
            console.error('SecretManager initialization failed:', error);
            throw error;
        }
    }

    async storeSecret(key, value) {
        await this.initPromise;
        try {
            const data = Array.from(new TextEncoder().encode(value));
            await this.store.insert(key, data);
            await this.stronghold.save();
            return true;
        } catch (error) {
            console.error('Failed to store secret:', error);
            throw new Error(`Failed to store secret: ${error.message}`);
        }
    }

    async getSecret(key) {
        await this.initPromise;
        try {
            const data = await this.store.get(key);
            return new TextDecoder().decode(new Uint8Array(data));
        } catch (error) {
            if (error.message.includes('Record not found')) {
                return null;
            }
            console.error('Failed to retrieve secret:', error);
            throw new Error(`Failed to retrieve secret: ${error.message}`);
        }
    }
}

// Create and export singleton instance
export const secretManager = new SecretManager();

// Start initialization immediately
secretManager.initialize().catch(error => {
    console.error('Failed to initialize SecretManager:', error);
});