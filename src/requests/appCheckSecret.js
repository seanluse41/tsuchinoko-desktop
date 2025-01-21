const { Client, Stronghold } = require('@tauri-apps/plugin-stronghold'); 
const { appDataDir } = require('@tauri-apps/api/path'); 

async function checkSecret(key) {
  try {
    const vaultPath = `${await appDataDir()}/vault.hold`;
    const vaultPassword = 'your_vault_password'; 
    const stronghold = await Stronghold.load(vaultPath, vaultPassword);

    const clientName = 'my_secret_client';
    const client = await stronghold.loadClient(clientName);
    const store = client.getStore();
    const data = await store.get(key);
    const value = new TextDecoder().decode(new Uint8Array(data));
    return value;
  } catch (error) {
    throw new Error(`Error checking secret: ${error}`);
  }
}

module.exports = { checkSecret };