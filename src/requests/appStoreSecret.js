const { Client, Stronghold } = require('@tauri-apps/plugin-stronghold'); 
const { appDataDir } = require('@tauri-apps/api/path'); 

async function storeSecret(key, value) {
  try {
    const vaultPath = `${await appDataDir()}/vault.hold`;
    const vaultPassword = 'your_vault_password'; // Replace with a strong password
    const stronghold = await Stronghold.load(vaultPath, vaultPassword);

    const clientName = 'my_secret_client';
    let client;
    try {
      client = await stronghold.loadClient(clientName);
    } catch (error) {
      client = await stronghold.createClient(clientName);
    }

    const store = client.getStore();
    const data = Array.from(new TextEncoder().encode(value));
    await store.insert(key, data);
    await stronghold.save();

    return 'Secret added successfully!';
  } catch (error) {
    throw new Error(`Error adding secret: ${error}`);
  }
}

module.exports = { storeSecret };