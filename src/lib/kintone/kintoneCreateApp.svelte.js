// src/lib/kintone/kintoneCreateApp.svelte.js

import { invoke } from "@tauri-apps/api/core";
import { authState } from '../app/appLoginManager.svelte.js';
import { refreshToken } from './kintoneRefreshRequest.js';
import { secretManager } from '../app/appSecretManager.svelte.js';
import { deployApp } from './kintoneDeployUtils.svelte.js';
import { discoverUsername, updateAppName } from './kintoneGetUsername.svelte.js';

/**
 * Creates a new Tsuuchinoko app in Kintone
 * @returns {Promise<Object>} Result of the creation process
 */
export async function createTsuuchinokoApp() {
    try {
        // Step 1: Create preview app
        console.log("Creating preview app...");
        const previewResponse = await createPreviewApp();
        console.log("Preview app created:", previewResponse);
        
        const appId = previewResponse.app;
        
        // Step 2: Add form fields
        console.log("Adding form fields...");
        await addFormFields(appId);
        console.log("Form fields added successfully");
        
        // Step 3: Update record number field code to taskID
        console.log("Updating record number field code...");
        await updateRecordNumberField(appId);
        console.log("Record number field updated successfully");
        
        // Store app ID in authState
        authState.user.appId = appId;
        
        // Step 4: Deploy the app and wait for deployment to complete
        console.log("Deploying app...");
        const deploymentSuccess = await deployApp(appId);
        console.log("Deployment result:", deploymentSuccess);
        
        // Only proceed with username discovery if deployment succeeded
        let username = 'user';
        if (deploymentSuccess) {
            try {
                // Step 5: Create a welcome record to discover username
                console.log("Discovering username...");
                username = await discoverUsername(appId);
                authState.user.username = username;
                
                // Step 6: Update the app name with the discovered username
                console.log("Updating app name with username:", username);
                await updateAppName(appId, username);
            } catch (error) {
                console.error("Error during post-deployment setup:", error);
                // Continue with default username if there's an error
            }
        } else {
            console.warn("Skipping username discovery due to deployment issues");
        }
        
        // Save credentials once at the end
        await secretManager.storeCredentials();
        
        return {
            success: true,
            appId,
            username,
            message: "Tsuuchinoko app created successfully!"
        };
    } catch (error) {
        console.error("Failed to create Tsuuchinoko app:", error);
        return {
            success: false,
            error: error.message || String(error),
            message: "Failed to create Tsuuchinoko app."
        };
    }
}

export async function createPreviewApp() {
    if (!authState.isAuthenticated || !authState.token) {
        throw new Error('Not authenticated');
    }
    
    try {
        const response = await invoke("kintone_create_preview_app", {
            appName: "TSUUCHINOKO",
            config: {
                subdomain: authState.user.subdomain,
                domain: authState.user.domain,
                access_token: authState.token
            }
        });
        return response;
    } catch (error) {
        if (error === "token_expired" && authState.refreshToken) {
            await refreshToken();
            return await createPreviewApp();
        }
        throw error;
    }
}

export async function addFormFields(appId) {
    if (!authState.isAuthenticated || !authState.token) {
        throw new Error('Not authenticated');
    }

    try {
        const fields = getFieldDefinitions();
        
        return await invoke("kintone_add_form_fields", {
            appId,
            fields,
            config: {
                subdomain: authState.user.subdomain,
                domain: authState.user.domain,
                access_token: authState.token
            }
        });
    } catch (error) {
        if (error === "token_expired" && authState.refreshToken) {
            await refreshToken();
            return await addFormFields(appId);
        }
        throw error;
    }
}

export async function updateRecordNumberField(appId) {
    if (!authState.isAuthenticated || !authState.token) {
        throw new Error('Not authenticated');
    }

    try {
        // Get current form fields
        console.log("Getting form fields...");
        const formFields = await getFormFields(appId);
        
        // Find the record number field
        let recordNumberFieldCode = null;
        let recordNumberField = null;
        
        for (const [fieldCode, field] of Object.entries(formFields.properties)) {
            if (field.type === 'RECORD_NUMBER') {
                recordNumberFieldCode = fieldCode;
                recordNumberField = field;
                break;
            }
        }
        
        if (!recordNumberFieldCode || !recordNumberField) {
            throw new Error("Record number field not found");
        }
        
        console.log(`Found record number field with code: ${recordNumberFieldCode}`);
        
        // Update the field code
        const updateProperties = {};
        updateProperties[recordNumberFieldCode] = {
            ...recordNumberField,
            code: "taskID",
            label: "タスクID"
        };
        
        return await invoke("kintone_update_form_fields", {
            appId,
            properties: updateProperties,
            config: {
                subdomain: authState.user.subdomain,
                domain: authState.user.domain,
                access_token: authState.token
            }
        });
    } catch (error) {
        if (error === "token_expired" && authState.refreshToken) {
            await refreshToken();
            return await updateRecordNumberField(appId);
        }
        throw error;
    }
}

export async function getFormFields(appId) {
    if (!authState.isAuthenticated || !authState.token) {
        throw new Error('Not authenticated');
    }

    try {
        return await invoke("kintone_get_form_fields", {
            appId,
            config: {
                subdomain: authState.user.subdomain,
                domain: authState.user.domain,
                access_token: authState.token
            }
        });
    } catch (error) {
        if (error === "token_expired" && authState.refreshToken) {
            await refreshToken();
            return await getFormFields(appId);
        }
        throw error;
    }
}

// Helper function to get all the field definitions for our app
export async function getFieldDefinitions() {
    return {
        "notificationTitle": {
            "type": "SINGLE_LINE_TEXT",
            "code": "notificationTitle",
            "label": "タイトル",
            "noLabel": false,
            "required": false,
            "unique": false,
            "defaultValue": ""
        },
        "taskCreationDateTime": {
            "type": "DATETIME",
            "code": "taskCreationDateTime",
            "label": "タスク化時刻",
            "noLabel": false,
            "required": false,
            "unique": false,
            "defaultValue": ""
        },
        "taskFolder": {
            "type": "SINGLE_LINE_TEXT",
            "code": "taskFolder",
            "label": "所属フォルダー",
            "noLabel": false,
            "required": false,
            "unique": false,
            "defaultValue": ""
        },
        "baseId": {
            "type": "SINGLE_LINE_TEXT",
            "code": "baseId",
            "label": "baseId",
            "noLabel": false,
            "required": false,
            "unique": true,
            "maxLength": "64",
            "defaultValue": ""
        },
        "groupKey": {
            "type": "SINGLE_LINE_TEXT",
            "code": "groupKey",
            "label": "groupKey",
            "noLabel": false,
            "required": false,
            "unique": false,
            "defaultValue": ""
        },
        "notificationContent": {
            "type": "MULTI_LINE_TEXT",
            "code": "notificationContent",
            "label": "内容",
            "noLabel": false,
            "required": false,
            "defaultValue": ""
        },
        "taskHolder": {
            "type": "USER_SELECT",
            "code": "taskHolder",
            "label": "タスク担当者",
            "noLabel": false,
            "required": false,
            "entities": [],
            "defaultValue": []
        },
        "taskCompletionMemo": {
            "type": "MULTI_LINE_TEXT",
            "code": "taskCompletionMemo",
            "label": "Completion Memo",
            "noLabel": false,
            "required": false,
            "defaultValue": ""
        },
        "taskMemo": {
            "type": "MULTI_LINE_TEXT",
            "code": "taskMemo",
            "label": "メモ",
            "noLabel": false,
            "required": false,
            "defaultValue": ""
        },
        "notificationDateTime": {
            "type": "DATETIME",
            "code": "notificationDateTime",
            "label": "通知時刻",
            "noLabel": false,
            "required": false,
            "unique": false,
            "defaultValue": ""
        },
        "taskStatus": {
            "type": "RADIO_BUTTON",
            "code": "taskStatus",
            "label": "ステータス",
            "noLabel": false,
            "required": true,
            "options": {
                "overdue": {
                    "label": "overdue",
                    "index": "2"
                },
                "registered": {
                    "label": "registered",
                    "index": "1"
                },
                "unregistered": {
                    "label": "unregistered",
                    "index": "0"
                },
                "completed": {
                    "label": "completed",
                    "index": "3"
                }
            },
            "defaultValue": "unregistered",
            "align": "HORIZONTAL"
        },
        "taskDeadline": {
            "type": "DATETIME",
            "code": "taskDeadline",
            "label": "タスクの期日",
            "noLabel": false,
            "required": false,
            "unique": false,
            "defaultValue": ""
        },
        "module_type": {
            "type": "SINGLE_LINE_TEXT",
            "code": "module_type",
            "label": "moduleType",
            "noLabel": false,
            "required": false,
            "unique": false,
            "defaultValue": ""
        },
        "taskPriority": {
            "type": "RADIO_BUTTON",
            "code": "taskPriority",
            "label": "タスクの優先度（依頼者指定）",
            "noLabel": false,
            "required": true,
            "options": {
                "normal": {
                    "label": "normal",
                    "index": "0"
                },
                "high": {
                    "label": "high",
                    "index": "1"
                },
                "urgent": {
                    "label": "urgent",
                    "index": "2"
                }
            },
            "defaultValue": "normal",
            "align": "HORIZONTAL"
        },
        "notificationSubtitle": {
            "type": "SINGLE_LINE_TEXT",
            "code": "notificationSubtitle",
            "label": "サブタイトル",
            "noLabel": false,
            "required": false,
            "unique": false,
            "defaultValue": ""
        },
        "notificationSender": {
            "type": "USER_SELECT",
            "code": "notificationSender",
            "label": "通知送信元",
            "noLabel": false,
            "required": false,
            "entities": [],
            "defaultValue": []
        },
        "module_id": {
            "type": "SINGLE_LINE_TEXT",
            "code": "module_id",
            "label": "module ID",
            "noLabel": false,
            "required": false,
            "unique": false,
            "defaultValue": ""
        },
        "ntf_url": {
            "type": "LINK",
            "code": "ntf_url",
            "label": "Notification URL",
            "noLabel": false,
            "required": false,
            "protocol": "WEB",
            "unique": false,
            "defaultValue": ""
        }
    };
}