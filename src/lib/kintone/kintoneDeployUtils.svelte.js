// src/lib/kintone/kintoneDeployUtils.svelte.js
import { invoke } from "@tauri-apps/api/core";
import { authState } from '../app/appLoginManager.svelte.js';
import { refreshToken } from './kintoneRefreshRequest.js';

export async function checkDeploymentStatus(appId) {
  try {
    const response = await invoke("kintone_get_deploy_status", {
      appIds: [appId],
      config: {
        subdomain: authState.user.subdomain,
        domain: authState.user.domain,
        access_token: authState.token
      }
    });
    
    console.log("Deployment status response:", response);
    
    const appStatus = response.apps?.find(app => app.app === appId);
    return appStatus ? appStatus.status : null;
  } catch (error) {
    console.error("Error checking deployment status:", error);
    return null;
  }
}

export async function waitForDeployment(appId, maxRetries = 20, delay = 1000) {
  console.log(`Waiting for app ${appId} deployment to complete...`);
  
  for (let i = 0; i < maxRetries; i++) {
    await new Promise(resolve => setTimeout(resolve, delay));
    
    const status = await checkDeploymentStatus(appId);
    console.log(`Status check ${i+1}/${maxRetries}: ${status}`);
    
    if (status === 'SUCCESS') {
      console.log(`App ${appId} deployment completed successfully!`);
      return true;
    } else if (status === 'FAIL' || status === 'CANCEL') {
      console.error(`App ${appId} deployment failed with status: ${status}`);
      return false;
    }
    
    // Continue waiting if status is PROCESSING or null
  }
  
  console.warn(`Deployment wait timed out after ${maxRetries} attempts`);
  return false;
}

export async function deployApp(appId) {
  try {
    // Issue the deploy command
    await invoke("kintone_deploy_app", {
      apps: [{ app: appId }],
      config: {
        subdomain: authState.user.subdomain,
        domain: authState.user.domain,
        access_token: authState.token
      }
    });
    
    console.log(`Requested deployment for app ${appId}`);
    
    // Wait for deployment to complete
    return await waitForDeployment(appId);
  } catch (error) {
    if (error === "token_expired" && authState.refreshToken) {
      await refreshToken();
      return await deployApp(appId);
    }
    console.error("Error deploying app:", error);
    return false;
  }
}