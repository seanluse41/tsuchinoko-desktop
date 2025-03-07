<!-- src/components/HelpModal.svelte -->
<script>
    import { Modal, Button, uiHelpers, Accordion, AccordionItem, Img, P, A } from 'svelte-5-ui-lib';
    import { QuestionCircleOutline } from "flowbite-svelte-icons";
    import { _ } from "svelte-i18n";

    let { modalUI = uiHelpers() } = $props();

    let modalStatus = $state(false);
    const closeModal = modalUI.close;

    $effect(() => {
        modalStatus = modalUI.isOpen;
    });
</script>

<Modal size="lg" {modalStatus} {closeModal}>
    <div class="text-center mb-4">
        <QuestionCircleOutline class="mx-auto mb-2 h-10 w-10 text-thistle-400" />
        <h2 class="text-2xl font-bold text-ebony-700">Help & Tips</h2>
    </div>

    <Accordion isSingle={true} class="mb-6">
        <AccordionItem>
            {#snippet header()}
                <span class="text-lg font-medium text-ebony-700">Selecting Tasks</span>
            {/snippet}
            <div class="p-4 bg-white rounded-md mb-2">
                <div class="flex flex-col gap-4">
                    <div>
                        <h3 class="font-semibold mb-1">Right-click to select</h3>
                        <P>Right-click on any task card to select it without opening the task details.</P>
                    </div>
                    <div>
                        <h3 class="font-semibold mb-1">Multi-select with Ctrl/Cmd</h3>
                        <P>Hold the Ctrl key (Windows) or Command key (Mac) while clicking to select multiple tasks.</P>
                    </div>
                    <div>
                        <h3 class="font-semibold mb-1">"Select All" button</h3>
                        <P>Use the "Select All" button to quickly select all visible tasks in the current view.</P>
                    </div>
                </div>
            </div>
        </AccordionItem>

        <AccordionItem>
            {#snippet header()}
                <span class="text-lg font-medium text-ebony-700">Folder Management</span>
            {/snippet}
            <div class="p-4 bg-white rounded-md mb-2">
                <div class="flex flex-col gap-4">
                    <div>
                        <h3 class="font-semibold mb-1">Drag and drop to folders</h3>
                        <P>Click and drag any task to a folder in the sidebar to move it. If a task is selected along with other tasks, all selected tasks will be moved together.</P>
                    </div>
                    <div>
                        <h3 class="font-semibold mb-1">Creating folders</h3>
                        <P>Click the "Add Folder" button at the bottom of the folder list to create a new folder.</P>
                    </div>
                    <div>
                        <h3 class="font-semibold mb-1">Folder filtering</h3>
                        <P>Click on any folder to show only tasks belonging to that folder. Click "All" to show all tasks.</P>
                    </div>
                </div>
            </div>
        </AccordionItem>

        <AccordionItem>
            {#snippet header()}
                <span class="text-lg font-medium text-ebony-700">Sorting & Filtering</span>
            {/snippet}
            <div class="p-4 bg-white rounded-md mb-2">
                <div class="flex flex-col gap-4">
                    <div>
                        <h3 class="font-semibold mb-1">Filter by status</h3>
                        <P>Use the Filter dropdown to show only tasks of a specific status (Overdue, Completed, Registered, or Unregistered).</P>
                    </div>
                    <div>
                        <h3 class="font-semibold mb-1">Sort tasks</h3>
                        <P>Use the Sort dropdown to arrange tasks by creation date or due date, in ascending or descending order.</P>
                    </div>
                </div>
            </div>
        </AccordionItem>

        <AccordionItem>
            {#snippet header()}
                <span class="text-lg font-medium text-ebony-700">Task Actions</span>
            {/snippet}
            <div class="p-4 bg-white rounded-md mb-2">
                <div class="flex flex-col gap-4">
                    <div>
                        <h3 class="font-semibold mb-1">Completing tasks</h3>
                        <P>Select one or more tasks and click "Mark Complete" to mark them as completed.</P>
                    </div>
                    <div>
                        <h3 class="font-semibold mb-1">Deleting tasks</h3>
                        <P>Select one or more tasks and click "Delete Selected" to remove them.</P>
                    </div>
                    <div>
                        <h3 class="font-semibold mb-1">Task details</h3>
                        <P>Click on a task (without holding Ctrl/Cmd) to open its detailed view.</P>
                    </div>
                </div>
            </div>
        </AccordionItem>

        <AccordionItem>
            {#snippet header()}
                <span class="text-lg font-medium text-ebony-700">Syncing & Refreshing</span>
            {/snippet}
            <div class="p-4 bg-white rounded-md mb-2">
                <div class="flex flex-col gap-4">
                    <div>
                        <h3 class="font-semibold mb-1">Manual sync</h3>
                        <P>Click the "Sync" button to manually refresh task data from Kintone.</P>
                    </div>
                    <div>
                        <h3 class="font-semibold mb-1">Auto-sync</h3>
                        <P>Tasks will automatically sync at the interval set in <A class="underline" href="/preferences">Preferences</A> (default is 15 minutes).</P>
                    </div>
                </div>
            </div>
        </AccordionItem>
    </Accordion>
    
    <div class="text-center">
        <Button 
            onclick={closeModal}
            class="bg-thistle-400 hover:bg-thistle-300"
        >
            Got it!
        </Button>
    </div>
</Modal>