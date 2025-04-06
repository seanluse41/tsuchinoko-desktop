// src/lib/kintone/kintoneCreateApp.svelte.js

import { invoke } from "@tauri-apps/api/core";
import { authState } from '../app/appLoginManager.svelte.js';
import { refreshToken } from './kintoneRefreshRequest.js';
import { secretManager } from '../app/appSecretManager.svelte.js';
import { getRecords } from './kintoneGetRecords.svelte.js';
import { addRecord } from './kintoneAddRecord.svelte.js';

export async function createTsuuchinokoApp() {
    try {
        // Step 1: Create preview app
        console.log("Creating preview app...");
        const previewResponse = await createPreviewApp();
        console.log("Preview app created:", previewResponse);
        
        const appId = previewResponse.app;
        let currentRevision = previewResponse.revision || "1";
        
        // Step 2: Add form fields
        console.log("Adding form fields...");
        const fieldsResponse = await addFormFields(appId, currentRevision);
        console.log("Form fields added successfully");
        currentRevision = fieldsResponse.revision;
        
        // Step 3: First deployment with all fields
        console.log("Deploying app with initial fields...");
        const initialDeployment = await deployApp(appId, currentRevision);
        
        if (!initialDeployment) {
            console.error("Initial app deployment failed");
            return {
                success: false,
                error: "Initial deployment failed",
                message: "Failed to deploy app with initial fields"
            };
        }
        
        // Store app ID in authState so we can use it for API calls
        authState.user.appId = appId;
        
        // Step 4: Add test record to deployed app
        console.log("Adding test record to deployed app...");
        let username = 'user';
        try {
            const welcomeData = {
                notificationTitle: "Welcome to Tsuuchinoko!",
                notificationContent: "This is your task management app. Click 'Help & Tips' in the sidebar to learn more about how to use Tsuuchinoko.",
                taskPriority: "normal",
                taskStatus: "registered",
                taskMemo: "Thank you for installing Tsuuchinoko. This task was automatically created during setup to help you get started."
            };
            
            const recordResponse = await addRecord(welcomeData);
            console.log("Welcome record created:", recordResponse);
            
            // Step 5: Get the username from the created record
            console.log("Getting records to extract username...");
            const response = await getRecords("");
            
            if (response && response.list && response.list.length > 0) {
                const record = response.list[0];
                
                // Extract username from creator object
                if (record.creator && record.creator.code) {
                    username = record.creator.code;
                    console.log("Found username:", username);
                    authState.user.username = username;
                }
            }
        } catch (recordError) {
            console.error("Error creating test record:", recordError);
            // Continue with default username
        }
        
        // Step 6: Update system fields (record number field and creator field)
        console.log("Updating system fields...");
        const systemFieldsResponse = await updateSystemFields(appId, currentRevision);
        console.log("System fields updated successfully");
        currentRevision = systemFieldsResponse.revision;
        
        // Step 7: Update app name with username
        console.log("Updating app name with username:", username);
        const nameResponse = await updateAppName(appId, username, currentRevision);
        console.log("App name updated successfully");
        currentRevision = nameResponse.revision || currentRevision;
        
        // Step 8: Final deployment with field code and name changes
        console.log("Performing final deployment...");
        const finalDeployment = await deployApp(appId, currentRevision);
        
        if (!finalDeployment) {
            console.warn("Final deployment had issues, but app is functional");
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
                access_token: authState.token,
                space: authState.user.spaceId
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
        const fields = getFieldDefinitions();
        
        return await invoke("kintone_add_form_fields", {
            appId,
            fields,
            revision, // Pass the current revision
            config: {
                subdomain: authState.user.subdomain,
                domain: authState.user.domain,
                access_token: authState.token
            }
        });
    } catch (error) {
        if (error === "token_expired" && authState.refreshToken) {
            await refreshToken();
            return await addFormFields(appId, revision);
        }
        throw error;
    }
}

export async function updateSystemFields(appId, revision) {
    if (!authState.isAuthenticated || !authState.token) {
        throw new Error('Not authenticated');
    }

    try {
        // Get current form fields
        console.log("Getting form fields for system field updates...");
        const formFields = await getFormFields(appId);
        const currentRevision = revision || formFields.revision;
        
        // Create an object to hold the fields we want to update
        const updateProperties = {};
        
        // Find and update the record number field
        for (const [fieldCode, field] of Object.entries(formFields.properties)) {
            if (field.type === 'RECORD_NUMBER') {
                updateProperties[fieldCode] = {
                    ...field,
                    code: "taskID",
                    label: "Task ID"
                };
            }
            
            // Find and update the creator field
            if (field.type === 'CREATOR') {
                updateProperties[fieldCode] = {
                    ...field,
                    code: "recordCreator",
                    label: "Creator"
                };
            }
        }
        
        if (Object.keys(updateProperties).length === 0) {
            return { revision: currentRevision };
        }
        
        return await invoke("kintone_update_form_fields", {
            appId,
            properties: updateProperties,
            revision: currentRevision,
            config: {
                subdomain: authState.user.subdomain,
                domain: authState.user.domain,
                access_token: authState.token
            }
        });
    } catch (error) {
        if (error === "token_expired" && authState.refreshToken) {
            await refreshToken();
            return await updateSystemFields(appId, revision);
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

async function deployApp(appId, revision) {
    try {
        const deployData = revision ? [{ app: appId, revision }] : [{ app: appId }];
        
        await invoke("kintone_deploy_app", {
            apps: deployData,
            config: {
                subdomain: authState.user.subdomain,
                domain: authState.user.domain,
                access_token: authState.token
            }
        });
        
        // Wait for deployment to completed
        return await waitForDeployment(appId);
    } catch (error) {
        if (error === "token_expired" && authState.refreshToken) {
            await refreshToken();
            return await deployApp(appId, revision);
        }
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

async function updateAppName(appId, username, revision) {
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
        
        return response;
    } catch (error) {
        console.error("Error updating app name:", error);
        if (error === "token_expired" && authState.refreshToken) {
            await refreshToken();
            return await updateAppName(appId, username, revision);
        }
        throw error;
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

// Helper function to get all the field definitions for our app
export function getFieldDefinitions() {
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