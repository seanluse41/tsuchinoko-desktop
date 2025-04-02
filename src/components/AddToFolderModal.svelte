<script>
    import { Modal, Button, Radio, Input, P, uiHelpers, Label, Spinner } from 'svelte-5-ui-lib';
    import { FolderPlusOutline } from "flowbite-svelte-icons";
    import { folderState, addUserFolder } from '$lib/app/appFolderManager.svelte.js';
    import { changeTaskFolder } from '$lib/kintone/kintoneChangeFolder.svelte.js';
    import { taskState } from '$lib/app/appTaskManager.svelte';
    import { _ } from "svelte-i18n";

    let { modalUI = uiHelpers() } = $props();

    // State for the modal
    let modalStatus = $state(false);
    let selectedFolder = $state('');
    let newFolderName = $state('');
    let isAddingNewFolder = $state(false);
    let error = $state('');
    let isSubmitting = $state(false);
    
    // For new folder validation
    let charCount = $derived(newFolderName.length);
    let isValid = $derived(newFolderName.trim().length > 0 && newFolderName.length <= 20);
    
    // Button label that changes during submission
    let submitButtonText = $derived(
        isSubmitting ? 
        `Moving ${taskState.selectedTasks.length} task${taskState.selectedTasks.length !== 1 ? 's' : ''}...` : 
        'Add to Folder'
    );
    
    const closeModal = modalUI.close;

    // Set initial state when modal opens
    $effect(() => {
        modalStatus = modalUI.isOpen;
        
        if (modalStatus) {
            // Reset state when modal opens
            selectedFolder = '';
            newFolderName = '';
            isAddingNewFolder = false;
            error = '';
            isSubmitting = false;
        }
    });

    // Handle folder selection
    function selectFolder(folder) {
        selectedFolder = folder;
        error = ''; // Clear any errors when a folder is selected
    }

    // Toggle new folder form
    function toggleNewFolderForm() {
        isAddingNewFolder = !isAddingNewFolder;
        if (!isAddingNewFolder) {
            newFolderName = '';
            error = '';
        }
    }

    // Create new folder
    async function createNewFolder() {
        if (!isValid) {
            error = "Folder name must be between 1-20 characters";
            return;
        }     
        
        if (folderState.folders.includes(newFolderName.trim())) {
            error = "Folder already exists";
            return;
        }
        
        try {
            // Add the new folder using the new function that persists to storage
            const result = await addUserFolder(newFolderName.trim());
            
            if (result) {
                // Select the newly created folder
                selectedFolder = newFolderName.trim();
                
                // Reset the new folder form
                isAddingNewFolder = false;
                newFolderName = '';
                error = '';
            } else {
                error = "Failed to create folder";
            }
        } catch (err) {
            console.error("Error creating folder:", err);
            error = "An error occurred while creating the folder";
        }
    }

    // Submit the modal and change folder
    async function handleSubmit() {
        if (!selectedFolder) {
            error = "Please select a folder";
            return;
        }
        
        if (taskState.selectedTasks.length === 0) {
            error = "No tasks selected";
            return;
        }
        
        try {
            isSubmitting = true;
            error = '';
            
            // Convert "All" folder to empty string as that's how it's stored in Kintone
            const targetFolderValue = selectedFolder === "All" ? "" : selectedFolder;
            
            // Use the changeTaskFolder function to update the tasks
            await changeTaskFolder(taskState.selectedTasks, targetFolderValue);
            
            // Close the modal after successful update
            closeModal();
        } catch (err) {
            console.error("Failed to change folder:", err);
            error = err.message || "Failed to change folder. Please try again.";
        } finally {
            isSubmitting = false;
        }
    }
</script>

<Modal {modalStatus} {closeModal} size="sm">
    <div class="flex items-center gap-2 mb-4">
        <FolderPlusOutline class="h-6 w-6 text-slate-700" />
        <h3 class="text-xl font-medium text-slate-700">Add to Folder</h3>
    </div>
    
    <div class="mb-4">
        <P class="mb-2 font-medium">Select a folder:</P>
        
        <div class="max-h-64 overflow-y-auto border border-slate-300 rounded-lg p-2 mb-3">
            {#each folderState.folders as folder}
                <div class="mb-2">
                    <Radio 
                        name="folder" 
                        value={folder} 
                        checked={selectedFolder === folder}
                        onclick={() => selectFolder(folder)}
                    >
                        {folder}
                    </Radio>
                </div>
            {/each}
            
            {#if folderState.folders.length <= 1}
                <P class="text-slate-500 italic p-2">No custom folders available</P>
            {/if}
        </div>
        
        {#if isAddingNewFolder}
            <div class="border border-slate-300 rounded-lg p-3 mb-3 bg-slate-50">
                <Label class="space-y-2">
                    <span>New Folder Name</span>
                    <Input 
                        type="text" 
                        placeholder="My Folder" 
                        bind:value={newFolderName}
                        maxlength="20"
                        required 
                    />
                    <div class="flex justify-between">
                        <span class="text-xs text-gray-500">{charCount}/20 characters</span>
                        {#if error && isAddingNewFolder}
                            <span class="text-xs text-red-500">{error}</span>
                        {/if}
                    </div>
                </Label>
                
                <div class="flex gap-2 mt-3">
                    <Button 
                        size="sm" 
                        class="bg-moss_green text-white" 
                        onclick={createNewFolder}
                        disabled={!isValid}
                    >
                        Create
                    </Button>
                    <Button 
                        size="sm" 
                        class="bg-slate-300" 
                        onclick={toggleNewFolderForm}
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        {:else}
            <Button 
                size="sm" 
                class="bg-thistle hover:bg-thistle-600 w-full" 
                onclick={toggleNewFolderForm}
            >
                + Create New Folder
            </Button>
        {/if}
        
        {#if error && !isAddingNewFolder}
            <P class="text-red-500 text-sm mt-2">{error}</P>
        {/if}
    </div>
    
    <div class="flex justify-end gap-3 mt-6">
        <Button 
            onclick={handleSubmit}
            class="bg-moss_green text-white flex items-center gap-2"
            disabled={!selectedFolder || isSubmitting}
        >
            {#if isSubmitting}
                <Spinner size="4" color="white" />
            {/if}
            {submitButtonText}
        </Button>
        <Button 
            onclick={closeModal}
            class="bg-thistle"
            disabled={isSubmitting}
        >
            Cancel
        </Button>
    </div>
</Modal>