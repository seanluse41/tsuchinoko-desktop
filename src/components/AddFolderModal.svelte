<script>
    import { Modal, Button, Label, Input, P, uiHelpers } from 'svelte-5-ui-lib';
    import { FolderPlusOutline } from "flowbite-svelte-icons";
    import { folderState, addUserFolder } from '$lib/app/appFolderManager.svelte.js';
    import { _ } from "svelte-i18n";

    let { modalUI = uiHelpers() } = $props();

    let folderName = $state('');
    let error = $state('');
    let modalStatus = $state(false);
    let isSubmitting = $state(false);
    
    let charCount = $derived(folderName.length);
    let isValid = $derived(folderName.trim().length > 0 && folderName.length <= 20);
    
    const closeModal = modalUI.close;

    $effect(() => {
        modalStatus = modalUI.isOpen;
        
        if (modalStatus) {
            folderName = '';
            error = '';
            isSubmitting = false;
        }
    });

    async function handleSubmit(event) {
        event.preventDefault();
        if (!isValid) {
            error = "Folder name must be between 1-20 characters";
            return;
        }
        
        try {
            isSubmitting = true;
            error = '';
            
            // Check if folder already exists
            if (folderState.folders.includes(folderName.trim())) {
                error = "Folder already exists";
                isSubmitting = false;
                return;
            }
            
            // Add user folder (persists to storage)
            const result = await addUserFolder(folderName.trim());
            
            if (result) {
                closeModal();
            } else {
                error = "Failed to create folder";
            }
        } catch (err) {
            console.error("Error creating folder:", err);
            error = "An error occurred creating the folder";
        } finally {
            isSubmitting = false;
        }
    }
</script>

<Modal {modalStatus} {closeModal} size="xs">
    <form class="flex flex-col space-y-6" onsubmit={handleSubmit}>
        <div class="flex items-center gap-2">
            <FolderPlusOutline class="h-6 w-6 text-slate-700" />
            <h3 class="text-xl font-medium text-slate-700">Add New Folder</h3>
        </div>
        
        <Label class="space-y-2">
            <span>Folder Name</span>
            <Input 
                type="text" 
                placeholder="My Folder" 
                bind:value={folderName}
                maxlength="20"
                required 
                disabled={isSubmitting}
            />
            <div class="flex justify-between">
                <span class="text-xs text-gray-500">{charCount}/20 characters</span>
                {#if error}
                    <span class="text-xs text-red-500">{error}</span>
                {/if}
            </div>
        </Label>
       
        <Button
            size="lg" 
            type="submit" 
            class="text-slate-700 font-bold rounded-lg border border-slate-700 p-4 hover:bg-slate-200 bg-white disabled:bg-slate-300 disabled:cursor-not-allowed"
            disabled={!isValid || isSubmitting}
        >
            {isSubmitting ? 'Creating...' : 'Add Folder'}
        </Button>
    </form>
</Modal>