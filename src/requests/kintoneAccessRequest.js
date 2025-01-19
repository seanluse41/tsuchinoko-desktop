// kintoneAccess.js
import { invoke } from "@tauri-apps/api/core";

export async function exchangeToken(code) {
  return invoke("kintone_exchange_token", {
    code,
    redirectUri: "https://seanbase.com/tsuuchinoko-auth"
  });
}