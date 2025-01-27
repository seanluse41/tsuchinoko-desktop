<!-- src/components/ConfirmationModal.svelte -->
<script>
    import { Modal, Button, uiHelpers } from 'svelte-5-ui-lib';
    import { ExclamationCircleOutline, TrashBinOutline, BadgeCheckOutline } from "flowbite-svelte-icons";
    import { taskState } from '../lib/appTaskManager.svelte';

    let { 
        modalUI = uiHelpers(),
        action = '',
        isConfirmation = true,
        message = '',
        onConfirm = () => {} 
    } = $props();

    let modalStatus = $state(false);
    const closeModal = modalUI.close;

    $effect(() => {
        modalStatus = modalUI.isOpen;
    });
    
    async function handleConfirm() {
        await onConfirm();
        closeModal();
    }
</script>

<Modal size="xs" {modalStatus} {closeModal}>
    <div class="text-center">
        {#if action === 'delete'}
            <TrashBinOutline class="mx-auto mb-4 h-12 w-12 text-redwood-400" />
        {:else if action === 'complete'}
            <BadgeCheckOutline class="mx-auto mb-4 h-12 w-12 text-moss_green-400" />
        {:else}
            <ExclamationCircleOutline class="mx-auto mb-4 h-12 w-12 text-amber-400" />
        {/if}
        
        <h3 class="mb-5 text-lg font-normal text-ebony-500">
            {#if message}
                {message}
            {:else}
                Are you sure you want to {action === 'delete' ? 'delete' : 'mark as complete'} {taskState.selectedTasks.length} {taskState.selectedTasks.length === 1 ? 'task' : 'tasks'}?
            {/if}
        </h3>
        
        {#if isConfirmation}
            <div class="flex justify-center gap-4">
                <Button 
                    onclick={handleConfirm}
                    class={action === 'delete' ? 'bg-redwood hover:bg-redwood-400' : 'bg-moss_green hover:bg-moss_green-400'}
                >
                    {action === 'delete' ? 'Yes, Delete' : 'Yes, Complete'}
                </Button>
                <Button 
                    onclick={closeModal}
                    class="bg-thistle-400 hover:bg-thistle-300"
                >
                    Cancel
                </Button>
            </div>
        {:else}
            <Button 
                onclick={closeModal}
                class="bg-thistle-400 hover:bg-thistle-300"
            >
                OK
            </Button>
        {/if}
    </div>
</Modal>