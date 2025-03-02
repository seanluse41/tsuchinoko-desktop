// src/lib/kintone/kintoneCreateApp.svelte.js
import { invoke } from "@tauri-apps/api/core";
import { authState } from '../app/appLoginManager.svelte.js';
import { refreshToken } from './kintoneRefreshRequest.js';
import { secretManager } from '../app/appSecretManager.svelte.js';

export async function createPreviewApp() {
    if (!authState.isAuthenticated || !authState.token) {
        throw new Error('Not authenticated');
    }
    try {
        // Add username to app name to make it unique per user
        const userName = authState.user.username || 'sean';
        const response = await invoke("kintone_create_preview_app", {
            appName: `TSUUCHINOKO - ${userName}`,
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

export async function addFormFields(appId, revision) {
    if (!authState.isAuthenticated || !authState.token) {
        throw new Error('Not authenticated');
    }

    try {
        // Define all the fields required for the Tsuuchinoko app
        const fields = getFieldDefinitions();
        
        const response = await invoke("kintone_add_form_fields", {
            appId,
            fields,
            revision,
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
            return await addFormFields(appId, revision);
        }
        throw error;
    }
}

export async function deployApp(appId, revision) {
    if (!authState.isAuthenticated || !authState.token) {
        throw new Error('Not authenticated');
    }

    try {
        const response = await invoke("kintone_deploy_app", {
            apps: [{ app: appId, revision }],
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
            return await deployApp(appId, revision);
        }
        throw error;
    }
}

export async function createTsuuchinokoApp() {
    try {
        // Step 1: Create preview app
        console.log("Creating preview app...");
        const previewResponse = await createPreviewApp();
        console.log("Preview app created:", previewResponse);
        
        const appId = previewResponse.app;
        let revision = previewResponse.revision;
        
        // Step 2: Add form fields
        console.log("Adding form fields...");
        const fieldsResponse = await addFormFields(appId, revision);
        console.log("Form fields added:", fieldsResponse);
        
        // Update revision for next step
        revision = fieldsResponse.revision;
        
        // Step 3: Update record number field code to taskID
        console.log("Updating record number field code...");
        const updateResponse = await updateRecordNumberField(appId, revision);
        console.log("Record number field updated:", updateResponse);
        
        // Update revision for deployment
        revision = updateResponse.revision;
        
        // Step 4: Deploy the app
        console.log("Deploying app...");
        await deployApp(appId, revision);
        console.log("App deployed successfully!");
        
        // Step 5: Save the app ID to auth state and secure storage
        authState.user.appId = appId;
        await secretManager.storeCredentials();
        
        return {
            success: true,
            appId,
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
// src/lib/kintone/kintoneCreateApp.svelte.js
export async function updateRecordNumberField(appId, revision) {
    if (!authState.isAuthenticated || !authState.token) {
        throw new Error('Not authenticated');
    }

    try {
        // First, get the form fields to find the record number field
        console.log("Getting form fields...");
        const formFields = await getFormFields(appId);
        
        // Find the field with type RECORD_NUMBER
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
        
        // Create update properties with only the found field
        const updateProperties = {};
        updateProperties[recordNumberFieldCode] = {
            ...recordNumberField,
            code: "taskID",
            label: "タスクID"
        };
        
        // Update the field code
        const response = await invoke("kintone_update_form_fields", {
            appId,
            properties: updateProperties,
            revision,
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
            return await updateRecordNumberField(appId, revision);
        }
        throw error;
    }
}

export async function getFormFields(appId) {
    if (!authState.isAuthenticated || !authState.token) {
        throw new Error('Not authenticated');
    }

    try {
        const response = await invoke("kintone_get_form_fields", {
            appId,
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
            return await getFormFields(appId);
        }
        throw error;
    }
}

// Helper function to get all the field definitions for our app
function getFieldDefinitions() {
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