<script>
    import { Modal, Button, Label, Input, P, uiHelpers } from 'svelte-5-ui-lib';
    import { FolderPlusOutline } from "flowbite-svelte-icons";
    import { folderState } from '$lib/app/appFolderManager.svelte.js';

    let { modalUI = uiHelpers() } = $props();

    let folderName = $state('');
    let error = $state('');
    let modalStatus = $state(false);
    
    let charCount = $derived(folderName.length);
    let isValid = $derived(folderName.trim().length > 0 && folderName.length <= 25);
    
    const closeModal = modalUI.close;

    $effect(() => {
        modalStatus = modalUI.isOpen;
        
        if (modalStatus) {
            folderName = '';
            error = '';
        }
    });

    function handleSubmit(event) {
        event.preventDefault();
        if (!isValid) {
            error = "Folder name must be between 1-25 characters";
            return;
        }     
        if (folderState.folders.includes(folderName.trim())) {
            error = "Folder already exists";
            return;
        }
        
        folderState.folders = [...folderState.folders, folderName.trim()];
        closeModal();
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
            />
            <div class="flex justify-between">
                <span class="text-xs text-gray-500">{charCount}/25 characters</span>
                {#if error}
                    <span class="text-xs text-red-500">{error}</span>
                {/if}
            </div>
        </Label>

        <P class="text-red-500">* Folders with no tasks will be deleted.</P>
        
        <Button
            size="lg" 
            type="submit" 
            class="text-slate-700 font-bold rounded-lg border border-slate-700 p-4 hover:bg-slate-200 bg-white disabled:bg-slate-300 disabled:cursor-not-allowed"
            disabled={!isValid}
        >
            Add Folder
        </Button>
    </form>
</Modal>