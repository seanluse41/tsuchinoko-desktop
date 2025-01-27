<!-- src/components/NoticeModal.svelte -->
<script>
    import { Modal, Button, uiHelpers } from 'svelte-5-ui-lib';
    import { ExclamationCircleOutline } from "flowbite-svelte-icons";

    let { 
        modalUI = uiHelpers(),
        message = ''
    } = $props();

    let modalStatus = $state(false);
    const closeModal = modalUI.close;

    $effect(() => {
        modalStatus = modalUI.isOpen;
    });
</script>

<Modal size="xs" {modalStatus} {closeModal}>
    <div class="text-center">
        <ExclamationCircleOutline class="mx-auto mb-4 h-12 w-12 text-amber-400" />
        
        <h3 class="mb-5 text-lg font-normal text-ebony-500">
            {message}
        </h3>
        
        <Button 
            onclick={closeModal}
            class="bg-thistle-400 hover:bg-thistle-300"
        >
            OK
        </Button>
    </div>
</Modal>