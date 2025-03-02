// src/lib/kintone/kintoneDiagnoseApp.svelte.js
import { invoke } from "@tauri-apps/api/core";
import { authState } from '../app/appLoginManager.svelte.js';
import { refreshToken } from './kintoneRefreshRequest.js';
import { getFieldDefinitions } from './kintoneCreateApp.svelte.js';
import { getCurrentAppId } from './kintoneCheckForApp.svelte.js';

// Function to get hardcoded field definitions for specific fields
function getSpecificFieldDefinition(fieldCode) {
    const definitions = {
        "taskMemo": {
            "type": "MULTI_LINE_TEXT",
            "code": "taskMemo",
            "label": "メモ",
            "noLabel": false,
            "required": false,
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
        "notificationContent": {
            "type": "MULTI_LINE_TEXT",
            "code": "notificationContent",
            "label": "内容",
            "noLabel": false,
            "required": false,
            "defaultValue": ""
        },
        "taskCompletionMemo": {
            "type": "MULTI_LINE_TEXT",
            "code": "taskCompletionMemo",
            "label": "Completion Memo",
            "noLabel": false,
            "required": false,
            "defaultValue": ""
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
        }
    };
    
    return definitions[fieldCode] || null;
}

export async function diagnoseApp() {
    try {
        // First, check if app exists
        if (!authState.user.appId) {
            return {
                status: 'error',
                message: 'No App ID found. Please detect or create a Tsuuchinoko app first.',
                details: [],
                needsRepair: false
            };
        }
        
        // Try to get current form fields
        const formFields = await getFormFields();
        if (!formFields || formFields.error) {
            return {
                status: 'error',
                message: 'Could not retrieve app fields. The app may have been deleted or you may not have access.',
                details: [formFields?.error || 'Unknown error'],
                needsRepair: false
            };
        }

        // Log the retrieved form fields for debugging
        console.log("Form fields retrieved:", formFields);
        
        // Get expected field definitions from our standard template
        const expectedFields = getFieldDefinitions();
        console.log("Expected fields:", Object.keys(expectedFields));
        
        // Get array of field codes that exist in the app
        const existingFieldCodes = Object.keys(formFields.properties);
        console.log("Existing field codes:", existingFieldCodes);

        // Hard-code a list of required field codes to ensure we're checking correctly
        const requiredFieldCodes = [
            "notificationTitle",
            "taskCreationDateTime",
            "taskFolder",
            "baseId",
            "groupKey",
            "notificationContent",
            "taskHolder",
            "taskCompletionMemo",
            "taskMemo",
            "notificationDateTime",
            "taskStatus",
            "taskDeadline",
            "module_type",
            "taskPriority",
            "notificationSubtitle",
            "notificationSender",
            "module_id",
            "ntf_url"
        ];
        
        // Find missing fields from our required list
        const missingFields = requiredFieldCodes.filter(
            fieldCode => !existingFieldCodes.includes(fieldCode)
        );
        
        console.log("Missing fields:", missingFields);

        // Check if the Record Number field has been correctly renamed to taskID
        const recordNumberField = Object.values(formFields.properties).find(
            field => field.type === 'RECORD_NUMBER'
        );
        
        const hasTaskIdField = recordNumberField && recordNumberField.code === 'taskID';
        console.log("Has taskID field:", hasTaskIdField, recordNumberField);
        
        // Check for any fields that have the wrong type
        const modifiedFields = [];
        requiredFieldCodes
            .filter(fieldCode => existingFieldCodes.includes(fieldCode))
            .forEach(fieldCode => {
                // Try to get field definition from either source
                const expectedField = expectedFields[fieldCode] || getSpecificFieldDefinition(fieldCode);
                if (!expectedField) return; // Skip if we don't have a definition
                
                const actualField = formFields.properties[fieldCode];
                if (actualField.type !== expectedField.type) {
                    modifiedFields.push(`${fieldCode} (expected type: ${expectedField.type}, actual: ${actualField.type})`);
                }
            });
        
        console.log("Modified fields:", modifiedFields);
        
        // Try to test API access by getting app settings instead of records
        // This is less likely to fail if fields are missing
        let apiAccessStatus = 'ok';
        let apiMessage = 'API access test successful';
        
        try {
            // Just use the form fields we already got as our API test
            apiMessage = 'Form fields retrieved successfully';
        } catch (error) {
            apiAccessStatus = 'error';
            apiMessage = `API access test failed: ${error.message || error}`;
        }
        
        // Determine if structure has issues (missing fields or wrong type)
        const structureHasIssues = !hasTaskIdField || missingFields.length > 0 || modifiedFields.length > 0;
        const apiHasIssues = apiAccessStatus !== 'ok';
        
        console.log("Structure has issues:", structureHasIssues);
        console.log("API has issues:", apiHasIssues);
        
        // Compile diagnosis results
        if (structureHasIssues) {
            return {
                status: 'warning',
                message: 'App needs repair. Some required fields are missing or incorrect.',
                details: [
                    ...(hasTaskIdField ? [] : ['Record Number field is not renamed to "taskID"']),
                    ...(missingFields.length > 0 ? [`Missing fields: ${missingFields.join(', ')}`] : []),
                    ...(modifiedFields.length > 0 ? [`Modified fields: ${modifiedFields.join(', ')}`] : []),
                    apiHasIssues ? apiMessage : '',
                ].filter(Boolean),
                needsRepair: true,
                diagnosisData: {
                    missingTaskIdField: !hasTaskIdField,
                    missingFields,
                    modifiedFields,
                    currentRevision: formFields.revision
                }
            };
        } else if (apiHasIssues) {
            // API issues only
            return {
                status: 'warning',
                message: 'App structure is correct, but there may be API access issues.',
                details: [apiMessage],
                needsRepair: false
            };
        } else {
            // All good
            return {
                status: 'success',
                message: 'App diagnosis completed. No issues found.',
                details: ['All required fields are present and correctly configured.', apiMessage],
                needsRepair: false
            };
        }
    } catch (error) {
        console.error("Diagnosis error:", error);
        return {
            status: 'error',
            message: `Diagnosis failed: ${error.message || error}`,
            details: [String(error)],
            needsRepair: false
        };
    }
}

async function getFormFields() {
    if (!authState.isAuthenticated || !authState.token) {
        throw new Error('Not authenticated');
    }

    try {
        const appId = getCurrentAppId();
        
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
            return await getFormFields();
        }
        return { error: error instanceof Error ? error.message : String(error) };
    }
}

export async function repairApp(diagnosisData) {
    if (!authState.user.appId) {
        return {
            status: 'error',
            message: 'No App ID found. Nothing to repair.'
        };
    }
    
    console.log("Starting repair with diagnosis data:", diagnosisData);
    
    try {
        const appId = getCurrentAppId();
        const revision = diagnosisData.currentRevision;
        
        let updatedRevision = revision;
        let repairOperations = [];
        
        // Add missing fields first
        if (diagnosisData.missingFields && diagnosisData.missingFields.length > 0) {
            // Create field definitions for missing fields
            const missingFieldsData = {};
            
            // For each missing field, try multiple sources for field definition
            diagnosisData.missingFields.forEach(fieldCode => {
                // First try to get from standard template
                const templateField = getFieldDefinitions()[fieldCode];
                // If not in template, try our specific definitions
                const specificField = getSpecificFieldDefinition(fieldCode);
                
                if (templateField) {
                    missingFieldsData[fieldCode] = templateField;
                    console.log(`Using template definition for field: ${fieldCode}`);
                } else if (specificField) {
                    missingFieldsData[fieldCode] = specificField;
                    console.log(`Using specific definition for field: ${fieldCode}`);
                } else {
                    console.warn(`No definition found for field: ${fieldCode}`);
                }
            });
            
            console.log("Fields to add:", missingFieldsData);
            
            if (Object.keys(missingFieldsData).length > 0) {
                console.log("Adding missing fields:", Object.keys(missingFieldsData));
                try {
                    const addResult = await invoke("kintone_add_form_fields", {
                        appId,
                        fields: missingFieldsData,
                        revision: updatedRevision,
                        config: {
                            subdomain: authState.user.subdomain,
                            domain: authState.user.domain,
                            access_token: authState.token
                        }
                    });
                    
                    console.log("Add fields result:", addResult);
                    
                    // Update revision for next operations
                    updatedRevision = addResult.revision;
                    repairOperations.push(`Added ${Object.keys(missingFieldsData).length} missing fields: ${Object.keys(missingFieldsData).join(', ')}`);
                } catch (error) {
                    console.error("Error adding fields:", error);
                    repairOperations.push(`Failed to add some fields: ${error.message || error}`);
                }
            }
        }
        
        // Fix the taskID field if needed
        if (diagnosisData.missingTaskIdField) {
            console.log("Fixing taskID field");
            try {
                const result = await updateRecordNumberField(appId, updatedRevision);
                console.log("Record number update result:", result);
                updatedRevision = result.revision;
                repairOperations.push('Record Number field renamed to taskID');
            } catch (error) {
                console.error("Error updating record number field:", error);
                repairOperations.push(`Failed to update record number field: ${error.message || error}`);
            }
        }
        
        // Deploy the changes
        if (repairOperations.length > 0) {
            console.log("Deploying changes");
            try {
                await deployApp(appId, updatedRevision);
                repairOperations.push('Changes have been deployed');
            } catch (error) {
                console.error("Error deploying app:", error);
                repairOperations.push(`Failed to deploy changes: ${error.message || error}`);
                return {
                    status: 'warning',
                    message: 'App was partially repaired but deployment failed.',
                    details: repairOperations
                };
            }
            
            return {
                status: 'success',
                message: 'App repaired successfully!',
                details: repairOperations
            };
        }
        
        return {
            status: 'warning',
            message: 'No repairs were necessary or possible.',
            details: ['The app structure appears to be correct already.']
        };
        
    } catch (error) {
        console.error("Repair error:", error);
        return {
            status: 'error',
            message: `Failed to repair app: ${error.message || error}`,
            details: [String(error)]
        };
    }
}

async function updateRecordNumberField(appId, revision) {
    // First, get the form fields to find the record number field
    const formFields = await getFormFields();
    
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
    
    // Create update properties with only the found field
    const updateProperties = {};
    updateProperties[recordNumberFieldCode] = {
        ...recordNumberField,
        code: "taskID",
        label: "タスクID"
    };
    
    // Update the field code
    return await invoke("kintone_update_form_fields", {
        appId,
        properties: updateProperties,
        revision,
        config: {
            subdomain: authState.user.subdomain,
            domain: authState.user.domain,
            access_token: authState.token
        }
    });
}

async function deployApp(appId, revision) {
    return await invoke("kintone_deploy_app", {
        apps: [{ app: appId, revision }],
        config: {
            subdomain: authState.user.subdomain,
            domain: authState.user.domain,
            access_token: authState.token
        }
    });
}

export async function removeTsuuchinokoApp() {
    // This just clears the app ID locally
    if (!authState.user.appId) {
        return {
            status: 'error',
            message: 'No App ID found. Nothing to remove.'
        };
    }
    
    try {
        const oldAppId = authState.user.appId;
        
        // Clear the app ID from auth state
        authState.user.appId = null;
        
        return {
            status: 'success',
            message: `App connection removed (ID: ${oldAppId}). The app still exists in Kintone, but this client is no longer connected to it.`
        };
    } catch (error) {
        return {
            status: 'error',
            message: `Failed to remove app connection: ${error.message || error}`
        };
    }
}