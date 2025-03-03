// src/lib/kintone/kintoneGetUsername.svelte.js
import { invoke } from "@tauri-apps/api/core";
import { authState } from '../app/appLoginManager.svelte.js';
import { refreshToken } from './kintoneRefreshRequest.js';
import { addRecord } from './kintoneAddRecord.svelte.js';
import { getRecords } from './kintoneGetRecords.svelte.js';
import { secretManager } from '../app/appSecretManager.svelte.js';

export async function discoverUsername(appId) {
  try {
    if (!authState.isAuthenticated || !authState.token) {
      throw new Error('Not authenticated');
    }

    // Create a welcome record
    const formData = {
      notificationTitle: "Welcome to Tsuuchinoko!",
      notificationContent: "This is your task management app. Click 'Help & Tips' in the sidebar to learn more about how to use Tsuuchinoko.",
      taskPriority: "normal",
      taskStatus: "registered",
      taskMemo: "Thank you for installing Tsuuchinoko. This task was automatically created during setup to help you get started."
    };

    console.log("Creating welcome record to discover username...");
    const createResponse = await addRecord(formData);

    console.log("create response")
    console.log(createResponse)
    
    // Get the record to retrieve creator information
    console.log("Retrieving welcome record to extract creator information...");
    const response = await getRecords();
    console.log(response)
   
    if (!response || !response.list || response.list.length === 0) {
      console.warn("Could not retrieve welcome record");
      return 'user';
    }

    
    // Extract creator information from the record
    const username = extractUsername(response.list[0]);
    console.log("Discovered username:", username);
    
    // Update authState with the discovered username
    authState.user.username = username;
    
    return username;
  } catch (error) {
    console.error("Error discovering username:", error);
    return 'user'; // Default fallback
  }
}

function extractUsername(record) {
  // Look for common creator field names
  if (record.creator && record.creator.name) {
    return record.creator.name;
  }
  
  // In case the field structure is different
  if (record.createdBy && record.createdBy.name) {
    return record.createdBy.name;
  }
  
  return 'user';
}

export async function updateAppName(appId, username) {
  if (!authState.isAuthenticated || !authState.token) {
    throw new Error('Not authenticated');
  }

  try {
    // Get current app settings first
    const currentSettings = await getAppSettings(appId);
    
    // Prepare the new app name
    const newAppName = `TSUUCHINOKO - ${username}`;
    
    // Prepare update payload
    const updatePayload = {
      app: appId,
      name: newAppName
    };
    
    // Keep other current settings if available
    if (currentSettings) {
      // Copy relevant fields we want to preserve
      if (currentSettings.description) updatePayload.description = currentSettings.description;
      if (currentSettings.icon) updatePayload.icon = currentSettings.icon;
      if (currentSettings.theme) updatePayload.theme = currentSettings.theme;
      if (currentSettings.titleField) updatePayload.titleField = currentSettings.titleField;
    }
    
    // Update app settings
    console.log("Updating app name to:", newAppName);
    const response = await invoke("kintone_update_app_settings", {
      settings: updatePayload,
      config: {
        subdomain: authState.user.subdomain,
        domain: authState.user.domain,
        access_token: authState.token
      }
    });
    
    // Deploy the changes
    await deployApp(appId);
    
    return true;
  } catch (error) {
    console.error("Error updating app name:", error);
    if (error === "token_expired" && authState.refreshToken) {
      await refreshToken();
      return await updateAppName(appId, username);
    }
    return false;
  }
}

async function getAppSettings(appId) {
  try {
    const response = await invoke("kintone_get_app_settings", {
      appId,
      config: {
        subdomain: authState.user.subdomain,
        domain: authState.user.domain,
        access_token: authState.token
      }
    });
    return response;
  } catch (error) {
    console.warn("Could not get current app settings:", error);
    return null;
  }
}

async function deployApp(appId) {
    try {
      // Request deployment
      await invoke("kintone_deploy_app", {
        apps: [{ app: appId }],
        config: {
          subdomain: authState.user.subdomain,
          domain: authState.user.domain,
          access_token: authState.token
        }
      });
      console.log("App deployment requested successfully");
      
      // Wait for deployment to complete
      return await waitForDeployment(appId);
    } catch (error) {
      console.error("Error deploying app:", error);
      throw error;
    }
  }
async function waitForDeployment(appId, maxRetries = 20, delay = 1000) {
    console.log(`Waiting for app ${appId} deployment to complete...`);
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        // Wait before checking
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Check deployment status
        const response = await invoke("kintone_get_deploy_status", {
          appIds: [appId],
          config: {
            subdomain: authState.user.subdomain,
            domain: authState.user.domain,
            access_token: authState.token
          }
        });
        
        // Look for the app status in the response
        const appStatus = response.apps?.find(app => app.app === appId);
        
        if (!appStatus) {
          console.log(`Status check ${i+1}/${maxRetries}: No status found for app ${appId}`);
          continue;
        }
        
        console.log(`Status check ${i+1}/${maxRetries}: ${appStatus.status}`);
        
        // If deployment completed (either success or failure)
        if (appStatus.status === 'SUCCESS') {
          console.log(`App ${appId} deployment completed successfully!`);
          return true;
        } else if (appStatus.status === 'FAIL' || appStatus.status === 'CANCEL') {
          console.error(`App ${appId} deployment failed with status: ${appStatus.status}`);
          return false;
        }
        
        // Continue polling if still processing
      } catch (error) {
        console.warn(`Error checking deployment status: ${error}`);
        // Continue with next retry
      }
    }
    
    console.warn(`App ${appId} deployment wait timed out after ${maxRetries} attempts`);
    return false;
  }