<!-- src/components/ConfirmCompleteModal.svelte -->
<script>
    import { Modal, Button, uiHelpers, Textarea, Label } from 'svelte-5-ui-lib';
    import { BadgeCheckOutline } from "flowbite-svelte-icons";
    import { taskState } from '$lib/app/appTaskManager.svelte';
    import { _ } from "svelte-i18n";

    let { modalUI = uiHelpers(), onConfirm = () => {} } = $props();

    let modalStatus = $state(false);
    let completionMemo = $state('');
    const closeModal = modalUI.close;

    $effect(() => {
        modalStatus = modalUI.isOpen;
        // Reset the memo when the modal opens
        if (modalUI.isOpen) {
            completionMemo = '';
        }
    });
    
    async function handleConfirm() {
        await onConfirm(completionMemo);
        closeModal();
    }
</script>

<Modal size="md" {modalStatus} {closeModal}>
    <div class="text-center">
        <BadgeCheckOutline class="mx-auto mb-4 h-12 w-12 text-moss_green-400" />
        
        <h3 class="mb-5 text-lg font-normal text-ebony-500">
            Are you sure you want to mark {taskState.selectedTasks.length} {taskState.selectedTasks.length === 1 ? 'task' : 'tasks'} as complete?
        </h3>
        
        <div class="mb-4">
            <Label for="completion-memo" class="block text-left mb-2 text-sm font-medium text-ebony-500">
                Completion Memo (optional)
            </Label>
            <Textarea 
                id="completion-memo"
                rows="3" 
                placeholder="Enter any notes about completing this task..."
                bind:value={completionMemo}
                class="w-full"
            />
        </div>
        
        <div class="flex justify-center gap-4">
            <Button 
                onclick={handleConfirm}
                class="bg-moss_green hover:bg-moss_green-400"
            >
                Yes, Complete
            </Button>
            <Button 
                onclick={closeModal}
                class="bg-thistle-400 hover:bg-thistle-300"
            >
                Cancel
            </Button>
        </div>
    </div>
</Modal>