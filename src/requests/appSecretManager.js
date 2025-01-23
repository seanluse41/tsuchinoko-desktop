import { Client, Stronghold } from '@tauri-apps/plugin-stronghold';
import { appDataDir } from '@tauri-apps/api/path';

const VAULT_PASSWORD = 'tsuuchinoko_vault_2024';
const CLIENT_NAME = 'tsuuchinoko_client';

class SecretManager {
    constructor() {
        this.isReady = false;
    }

    async initialize() {
        if (this.isReady) return;
    
        try {
            const vaultPath = `${await appDataDir()}/vault.hold`;
            try {
                this.stronghold = await Stronghold.load(vaultPath, VAULT_PASSWORD);
            } catch (e) {
                // Create new vault if it doesn't exist
                this.stronghold = await Stronghold.create(vaultPath, VAULT_PASSWORD);
            }

            try {
                this.client = await this.stronghold.loadClient(CLIENT_NAME);
            } catch {
                this.client = await this.stronghold.createClient(CLIENT_NAME);
            }

            this.store = this.client.getStore();
            this.isReady = true;
            return this.store;
        } catch (error) {
            console.error('SecretManager initialization failed:', error);
            throw error;
        }
    }

    async storeSecret(key, value) {
        if (!this.isReady) {
            await this.initialize();
        }

        const data = Array.from(new TextEncoder().encode(value));
        await this.store.insert(key, data);
        await this.stronghold.save();
        return true;
    }

    async getSecret(key) {
        if (!this.isReady) {
            await this.initialize();
        }

        try {
            const data = await this.store.get(key);
            return new TextDecoder().decode(new Uint8Array(data));
        } catch (error) {
            if (error.message.includes('Record not found')) {
                return null;
            }
            throw error;
        }
    }

    async remove(key) {
        if (!this.isReady) {
            await this.initialize();
        }
    
        try {
            await this.store.remove(key);
            await this.stronghold.save();
            return true;
        } catch {
            return false;
        }
    }
}

export const secretManager = new SecretManager();