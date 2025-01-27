<!-- src/components/TaskDetailsCommands.svelte -->
<script>
    import {
        Sidebar,
        SidebarGroup,
        SidebarItem,
        SidebarButton,
        uiHelpers,
    } from "svelte-5-ui-lib";
    import {
        FolderPlusOutline,
        BadgeCheckOutline,
        LinkOutline,
        BellRingOutline,
        FileCopyOutline,
        TrashBinOutline,
    } from "flowbite-svelte-icons";
    import { goto } from "$app/navigation";
    import { open } from "@tauri-apps/plugin-shell";
    import { authState } from "$lib/appLoginManager.svelte";
    import { deleteRecords } from "$lib/kintoneDeleteRecords.svelte.js";
    import { updateTaskStatus } from "$lib/kintoneUpdateRecords.svelte";
    import { taskState, allTasksCompleted } from "$lib/appTaskManager.svelte";
    import ConfirmationModal from "./ConfirmationModal.svelte";

    const sidebarUI = uiHelpers();
    const deleteModalUI = uiHelpers();
    const completeModalUI = uiHelpers();
    
    let isOpen = $state(true);
    const closeSidebar = sidebarUI.close;

    let { taskId } = $props();

    $effect(() => {
        isOpen = sidebarUI.isOpen;
        if (taskId) {
            taskState.selectedTasks = [taskId];
        }
    });

    const addToGroup = () => console.log("add to group");

    const completeTask = () => {
        completeModalUI.toggle();
    };

    const handleComplete = async () => {
        if (!allTasksCompleted(taskState.selectedTasks, taskState.tasks)) {
            try {
                await updateTaskStatus("16");
                goto("/home");
            } catch (err) {
                console.error("failed to complete task", err);
            }
        }
    };

    const viewInKintone = async () => {
        const url = `https://${authState.user.subdomain}.${authState.user.domain}/k/16/show#record=${taskId}`;
        await open(url);
    };

    const viewNotification = () => console.log("view notification");
    const copyToClipboard = () => console.log("copy to clipboard");
    
    const deleteTask = () => {
        deleteModalUI.toggle();
    };

    const handleDelete = async () => {
        try {
            await deleteRecords("16");
            goto("/home");
        } catch (err) {
            console.error("Failed to delete tasks:", err);
        }
    };
</script>

<div class="relative">
    <SidebarButton onclick={sidebarUI.toggle} class="mb-2" />
    <Sidebar
        isSingle={false}
        backdrop={false}
        {isOpen}
        {closeSidebar}
        class="bg-thistle z-10 h-full border-r-2 border-ebony"
        divClass="bg-transparent px-6 py-20 overflow-y-auto"
    >
        <SidebarGroup>
            <SidebarItem
                label="Add to Group"
                onclick={addToGroup}
                class="cursor-pointer mb-3"
                activeClass="flex items-center text-base font-normal text-gray-900 rounded-lg border border-ebony-200 p-3 hover:bg-thistle-800 bg-white"
                nonActiveClass="flex items-center text-base font-normal text-gray-900 rounded-lg border border-ebony-200 p-3 hover:bg-thistle-800 bg-white"
            >
                {#snippet iconSlot()}
                    <FolderPlusOutline
                        class="h-5 w-5 text-ebony-600 transition-colors hover:text-moss_green-600"
                    />
                {/snippet}
            </SidebarItem>

            <SidebarItem
                label="Mark Complete"
                onclick={completeTask}
                class="cursor-pointer mb-3"
                activeClass="flex items-center text-base font-normal text-gray-900 rounded-lg border border-ebony-200 p-3 hover:bg-thistle-800 bg-white"
                nonActiveClass="flex items-center text-base font-normal text-gray-900 rounded-lg border border-ebony-200 p-3 hover:bg-thistle-800 bg-white"
            >
                {#snippet iconSlot()}
                    <BadgeCheckOutline
                        class="h-5 w-5 text-ebony-600 transition-colors hover:text-moss_green-600"
                    />
                {/snippet}
            </SidebarItem>

            <SidebarItem
                label="View in Kintone"
                onclick={viewInKintone}
                class="cursor-pointer mb-3"
                activeClass="flex items-center text-base font-normal text-gray-900 rounded-lg border border-ebony-200 p-3 hover:bg-thistle-800 bg-white"
                nonActiveClass="flex items-center text-base font-normal text-gray-900 rounded-lg border border-ebony-200 p-3 hover:bg-thistle-800 bg-white"
            >
                {#snippet iconSlot()}
                    <LinkOutline
                        class="h-5 w-5 text-ebony-600 transition-colors hover:text-moss_green-600"
                    />
                {/snippet}
            </SidebarItem>

            <SidebarItem
                label="View Notification"
                onclick={viewNotification}
                class="cursor-pointer mb-3"
                activeClass="flex items-center text-base font-normal text-gray-900 rounded-lg border border-ebony-200 p-3 hover:bg-thistle-800 bg-white"
                nonActiveClass="flex items-center text-base font-normal text-gray-900 rounded-lg border border-ebony-200 p-3 hover:bg-thistle-800 bg-white"
            >
                {#snippet iconSlot()}
                    <BellRingOutline
                        class="h-5 w-5 text-ebony-600 transition-colors hover:text-moss_green-600"
                    />
                {/snippet}
            </SidebarItem>

            <SidebarItem
                label="Copy to Clipboard"
                onclick={copyToClipboard}
                class="cursor-pointer mb-3"
                activeClass="flex items-center text-base font-normal text-gray-900 rounded-lg border border-ebony-200 p-3 hover:bg-thistle-800 bg-white"
                nonActiveClass="flex items-center text-base font-normal text-gray-900 rounded-lg border border-ebony-200 p-3 hover:bg-thistle-800 bg-white"
            >
                {#snippet iconSlot()}
                    <FileCopyOutline
                        class="h-5 w-5 text-ebony-600 transition-colors hover:text-moss_green-600"
                    />
                {/snippet}
            </SidebarItem>

            <SidebarItem
                label="Delete Task"
                onclick={deleteTask}
                class="cursor-pointer mb-3"
                activeClass="flex items-center text-base font-normal text-gray-900 rounded-lg border border-ebony-200 p-3 hover:bg-red-500 bg-white"
                nonActiveClass="flex items-center text-base font-normal text-gray-900 rounded-lg border border-ebony-200 p-3 hover:bg-red-500 bg-white"
            >
                {#snippet iconSlot()}
                    <TrashBinOutline
                        class="h-5 w-5 text-ebony-600 transition-colors"
                    />
                {/snippet}
            </SidebarItem>
        </SidebarGroup>
    </Sidebar>
</div>

<ConfirmationModal 
    modalUI={deleteModalUI}
    action="delete"
    onConfirm={handleDelete}
/>

<ConfirmationModal 
    modalUI={completeModalUI}
    action="complete"
    onConfirm={handleComplete}
    isConfirmation={!allTasksCompleted(taskState.selectedTasks, taskState.tasks)}
    message={allTasksCompleted(taskState.selectedTasks, taskState.tasks) ? "This task is already completed." : ""}
/>