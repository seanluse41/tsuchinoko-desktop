<!-- src/components/ConfirmDeleteModal.svelte -->
<script>
    import { Modal, Button, uiHelpers } from 'svelte-5-ui-lib';
    import { TrashBinOutline } from "flowbite-svelte-icons";
    import { taskState } from '$lib/app/appTaskManager.svelte';
    import { _ } from "svelte-i18n";

    let { modalUI = uiHelpers(), onConfirm = () => {} } = $props();

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
        <TrashBinOutline class="mx-auto mb-4 h-12 w-12 text-redwood-400" />
        
        <h3 class="mb-5 text-lg font-normal text-ebony-500">
            Are you sure you want to delete {taskState.selectedTasks.length} {taskState.selectedTasks.length === 1 ? 'task' : 'tasks'}?
        </h3>
        
        <div class="flex justify-center gap-4">
            <Button 
                onclick={handleConfirm}
                class="bg-redwood hover:bg-redwood-400"
            >
                Yes, Delete
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