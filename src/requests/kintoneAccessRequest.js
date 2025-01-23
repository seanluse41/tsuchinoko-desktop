// kintoneAccessRequest.js
import { invoke } from "@tauri-apps/api/core";
import { secretManager } from './appSecretManager';
import { goto } from "$app/navigation";

let isProcessingAuth = false;

async function getConfig() {
 const [clientId, clientSecret, subdomain] = await Promise.all([
   secretManager.getSecret('kintone_client_id'),
   secretManager.getSecret('kintone_client_secret'), 
   secretManager.getSecret('kintone_subdomain')
 ]);

 if (!clientId || !clientSecret || !subdomain) {
   throw new Error('Missing required credentials');
 }

 return { client_id: clientId, client_secret: clientSecret, subdomain };
}

export async function exchangeToken(code) {
 if (isProcessingAuth) {
   return;
 }

 isProcessingAuth = true;
 try {
   const config = await getConfig();
   const response = await invoke("kintone_exchange_token", {
     code,
     redirectUri: "https://seanbase.com/tsuuchinoko-auth",
     config
   });

   if (response.refresh_token) {
     await secretManager.storeSecret('kintone_refresh_token', response.refresh_token);
   }
   await secretManager.storeSecret('kintone_access_token', response.access_token);
   
   await goto('/home');
   return response;
 } catch (error) {
   console.error('Token exchange failed:', error);
   throw error;
 } finally {
   isProcessingAuth = false;
 }
}

export async function refreshToken() {
 try {
   const config = await getConfig();
   const savedRefreshToken = await secretManager.getSecret('kintone_refresh_token');
   
   if (!savedRefreshToken) {
     throw new Error('No refresh token available');
   }

   const response = await invoke("kintone_refresh_token", {
     refreshToken: savedRefreshToken,
     config
   });

   await secretManager.storeSecret('kintone_access_token', response.access_token);
   return response;
 } catch (error) {
   console.error('Token refresh failed:', error);
   throw error;
 }
}