const { Client, Stronghold } = require('@tauri-apps/plugin-stronghold'); 
const { appDataDir } = require('@tauri-apps/api/path'); 

async function removeSecret(key) {
  try {
    const vaultPath = `${await appDataDir()}/vault.hold`;
    const vaultPassword = 'your_vault_password'; 
    const stronghold = await Stronghold.load(vaultPath, vaultPassword);

    const clientName = 'my_secret_client';
    const client = await stronghold.loadClient(clientName);
    const store = client.getStore();
    await store.remove(key);
    await stronghold.save();

    return 'Secret removed successfully!';
  } catch (error) {
    throw new Error(`Error removing secret: ${error}`);
  }
}

module.exports = { removeSecret };