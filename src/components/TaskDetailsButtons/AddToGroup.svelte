<!-- src/components/TaskDetailsButtons/AddToGroup.svelte -->
<script>
    import { SidebarItem, uiHelpers } from "svelte-5-ui-lib";
    import { FolderPlusOutline } from "flowbite-svelte-icons";
    import AddToFolderModal from "../AddToFolderModal.svelte";
    import { taskState } from "$lib/app/appTaskManager.svelte";
    import { _ } from "svelte-i18n";
    
    // Create a UI helper for the modal
    const modalUI = uiHelpers();
    
    // Determine if the button should be enabled
    let isButtonDisabled = $derived(taskState.selectedTasks.length === 0);
    
    // Function to open the modal
    const addToGroup = () => {
        if (!isButtonDisabled) {
            modalUI.toggle();
        }
    };
</script>

<SidebarItem
    label={$_('taskDetailsButtons.addToFolder')}
    onclick={addToGroup}
    class="cursor-pointer mb-3 {isButtonDisabled ? 'opacity-50' : ''}"
    activeClass="flex items-center text-base font-normal text-gray-900 rounded-lg border border-ebony-200 p-3 bg-white {isButtonDisabled ? 'cursor-not-allowed' : 'hover:bg-thistle-800'}"
    nonActiveClass="flex items-center text-base font-normal text-gray-900 rounded-lg border border-ebony-200 p-3 bg-white {isButtonDisabled ? 'cursor-not-allowed' : 'hover:bg-thistle-800'}"
>
    {#snippet iconSlot()}
        <FolderPlusOutline class="h-5 w-5 text-ebony-600 transition-colors hover:text-moss_green-600" />
    {/snippet}
</SidebarItem>

<!-- Add the modal component -->
<AddToFolderModal modalUI={modalUI} />