// src/lib/app/appFolderManager.svelte.js
import { resetFiltersAndSort } from './appTaskFilters.svelte.js';
import { taskState } from './appTaskManager.svelte.js';
import { load } from '@tauri-apps/plugin-store';

// State for folder management
export const folderState = $state({
    selectedFolder: 'All',
    folders: ['All'], // Always includes 'All'
    userCreatedFolders: [] // Explicitly tracks user-created folders
});

// File path for the folder store
const FOLDERS_STORE_PATH = 'folders.json';
let folderStoreInstance = null;

// Get or initialize the store
async function getFolderStore() {
    if (!folderStoreInstance) {
        // Load or create the store with autoSave disabled
        folderStoreInstance = await load(FOLDERS_STORE_PATH, { autoSave: false });
    }
    return folderStoreInstance;
}

// Select a folder
export function selectFolder(folderId) {
    if (folderState.selectedFolder !== folderId) {
        resetFiltersAndSort();
        // Safely check taskState exists and selectedTasks is an array
        if (taskState && Array.isArray(taskState.selectedTasks)) {
            taskState.selectedTasks = [];
        }
        folderState.selectedFolder = folderId;
    }
}

// Add a user-created folder
export async function addUserFolder(folderName) {
    if (!folderName || folderName.trim() === '' || folderName === 'All') {
        return false;
    }
    
    const normalizedName = folderName.trim();
    
    // Check if folder already exists
    if (folderState.userCreatedFolders.includes(normalizedName)) {
        return false;
    }
    
    // Add to user-created folders
    folderState.userCreatedFolders = [...folderState.userCreatedFolders, normalizedName];
    
    // Update the combined folders list
    updateFoldersList();
    
    // Save to local storage
    await saveFolders();
    
    return true;
}

// Update the combined folders list (All + user folders + task folders)
export function updateFoldersList(taskFolders = []) {
    // Start with 'All' folder and add user folders
    let combinedFolders = ['All', ...folderState.userCreatedFolders];
    
    // Add task folders if not already in the list
    taskFolders.forEach(folder => {
        if (folder && !combinedFolders.includes(folder)) {
            combinedFolders.push(folder);
        }
    });
    
    // Update the folders list
    folderState.folders = combinedFolders;
}

// Save folders to local storage
export async function saveFolders() {
    try {
        const store = await getFolderStore();
        
        await store.set('userFolders', folderState.userCreatedFolders);
        
        // save to disk
        await store.save();
        console.log('Folders saved successfully');
    } catch (error) {
        console.error('Failed to save folders:', error);
    }
}

// Load folders from local storage
export async function loadFolders() {
    try {
        const store = await getFolderStore();
        
        // Get the user folders
        const savedFolders = await store.get('userFolders');
        
        if (savedFolders && Array.isArray(savedFolders)) {
            // Update the user-created folders
            folderState.userCreatedFolders = savedFolders;
            
            // Update the combined folders list
            updateFoldersList();
            
            console.log('Folders loaded successfully');
        } else {
            console.log('No saved folders found, using defaults');
            // Save the default empty list
            await saveFolders();
        }
    } catch (error) {
        console.error('Failed to load folders:', error);
    }
}

// Delete a user-created folder
export async function deleteUserFolder(folderName) {
    if (!folderName || folderName === 'All') {
        return false;
    }
    
    // Check if folder exists in user-created folders
    if (!folderState.userCreatedFolders.includes(folderName)) {
        return false;
    }
    
    // Remove from user-created folders
    folderState.userCreatedFolders = folderState.userCreatedFolders.filter(f => f !== folderName);
    
    // Update the combined folders list
    updateFoldersList();
    
    // Save to local storage
    await saveFolders();
    
    // If the deleted folder was the selected one, switch to 'All'
    if (folderState.selectedFolder === folderName) {
        selectFolder('All');
    }
    
    return true;
}

// Initialize folder management
export async function initializeFolders() {
    await loadFolders();
}