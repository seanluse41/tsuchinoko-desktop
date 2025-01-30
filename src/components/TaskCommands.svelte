<!-- src/components/TaskCommands.svelte -->
<script>
    import {
        Sidebar,
        SidebarGroup,
        SidebarButton,
        uiHelpers,
        SidebarItem,
    } from "svelte-5-ui-lib";
    import { FolderOutline } from "flowbite-svelte-icons";
    import { goto } from "$app/navigation";
    import { droppable } from "@thisux/sveltednd";
    import { taskState, allTasksCompleted } from "../lib/appTaskManager.svelte";
    import {
        dragState,
        setActiveFolderId,
        clearActiveFolderId,
    } from "../lib/appTaskDragState.svelte.js";
    import { updateTaskStatus } from "../lib/kintoneUpdateRecords.svelte";
    import { deleteRecords } from "../lib/kintoneDeleteRecords.svelte.js";
    import ConfirmDeleteModal from "./ConfirmDeleteModal.svelte";
    import ConfirmCompleteModal from "./ConfirmCompleteModal.svelte";
    import NoticeModal from "./NoticeModal.svelte";

    import FilterButton from "./HomeTaskButtons/FilterTasks.svelte";
    import SortButton from "./HomeTaskButtons/SortTasks.svelte";
    import SyncButton from "./HomeTaskButtons/SyncTasks.svelte";
    import SelectAllButton from "./HomeTaskButtons/SelectAllTasks.svelte";
    import CompleteButton from "./HomeTaskButtons/CompleteTasks.svelte";
    import DeleteButton from "./HomeTaskButtons/DeleteTasks.svelte";

    const sidebarUI = uiHelpers();
    const deleteModalUI = uiHelpers();
    const completeModalUI = uiHelpers();
    let isOpen = $state(true);
    const closeSidebar = sidebarUI.close;

    $effect(() => {
        isOpen = sidebarUI.isOpen;
    });

    const handleComplete = async () => {
        try {
            await updateTaskStatus("16");
        } catch (err) {
            console.error("failed to complete task", err);
        }
    };

    const handleDelete = async () => {
        try {
            await deleteRecords("16");
            if (window.location.pathname.includes("/task/")) {
                goto("/home");
            }
        } catch (err) {
            console.error("Failed to delete tasks:", err);
        }
    };

    function handleDrop(folderId) {
        return (state) => {
            clearActiveFolderId();
        };
    }

    function handleDragEnter(folderId) {
        return () => {
            setActiveFolderId(folderId);
        };
    }

    function handleDragLeave() {
        return () => {
            clearActiveFolderId();
        };
    }
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
            <FilterButton />
            <SortButton />
            <SyncButton />
        </SidebarGroup>

        <SidebarGroup border>
            <SelectAllButton />
            <CompleteButton modalUI={completeModalUI} />
            <DeleteButton modalUI={deleteModalUI} />
        </SidebarGroup>

        <SidebarGroup border>
            <div
                class="folder-item {dragState.activeFolderId === '1'
                    ? 'bg-moss_green-50 animated-outline'
                    : ''}"
                use:droppable={{
                    container: "folder1",
                    callbacks: {
                        onDrop: handleDrop("1"),
                        onDragEnter: handleDragEnter("1"),
                        onDragLeave: handleDragLeave(),
                    },
                }}
            >
                <SidebarItem
                    label="Folder 1"
                    class="cursor-pointer"
                    activeClass="flex items-center text-base font-normal text-gray-900 rounded-lg border border-ebony-200 p-3 hover:bg-thistle-800 bg-white"
                    nonActiveClass="flex items-center text-base font-normal text-gray-900 rounded-lg border border-ebony-200 p-3 hover:bg-thistle-800 bg-white"
                >
                    {#snippet iconSlot()}
                        <FolderOutline
                            class="h-5 w-5 text-ebony-600 transition-colors hover:text-moss_green-600"
                        />
                    {/snippet}
                </SidebarItem>
            </div>

            <div
                class="folder-item {dragState.activeFolderId === '2'
                    ? 'bg-moss_green-50 animated-outline'
                    : ''}"
                use:droppable={{
                    container: "folder2",
                    callbacks: {
                        onDrop: handleDrop("2"),
                        onDragEnter: handleDragEnter("2"),
                        onDragLeave: handleDragLeave(),
                    },
                }}
            >
                <SidebarItem
                    label="Folder 2"
                    class="cursor-pointer"
                    activeClass="flex items-center text-base font-normal text-gray-900 rounded-lg border border-ebony-200 p-3 hover:bg-thistle-800 bg-white"
                    nonActiveClass="flex items-center text-base font-normal text-gray-900 rounded-lg border border-ebony-200 p-3 hover:bg-thistle-800 bg-white"
                >
                    {#snippet iconSlot()}
                        <FolderOutline
                            class="h-5 w-5 text-ebony-600 transition-colors hover:text-moss_green-600"
                        />
                    {/snippet}
                </SidebarItem>
            </div>

            <div
                class="folder-item {dragState.activeFolderId === '3'
                    ? 'bg-moss_green-50 animated-outline'
                    : ''}"
                use:droppable={{
                    container: "folder3",
                    callbacks: {
                        onDrop: handleDrop("3"),
                        onDragEnter: handleDragEnter("3"),
                        onDragLeave: handleDragLeave(),
                    },
                }}
            >
                <SidebarItem
                    label="Folder 3"
                    class="cursor-pointer"
                    activeClass="flex items-center text-base font-normal text-gray-900 rounded-lg border border-ebony-200 p-3 hover:bg-thistle-800 bg-white"
                    nonActiveClass="flex items-center text-base font-normal text-gray-900 rounded-lg border border-ebony-200 p-3 hover:bg-thistle-800 bg-white"
                >
                    {#snippet iconSlot()}
                        <FolderOutline
                            class="h-5 w-5 text-ebony-600 transition-colors hover:text-moss_green-600"
                        />
                    {/snippet}
                </SidebarItem>
            </div>
        </SidebarGroup>
    </Sidebar>
</div>

<ConfirmDeleteModal modalUI={deleteModalUI} onConfirm={handleDelete} />

{#if allTasksCompleted(taskState.selectedTasks, taskState.tasks)}
    <NoticeModal
        modalUI={completeModalUI}
        message="All selected tasks are already completed."
    />
{:else}
    <ConfirmCompleteModal
        modalUI={completeModalUI}
        onConfirm={handleComplete}
    />
{/if}

<style>
.folder-item {
    position: relative;
    padding: 2px;
    margin-bottom: 1rem;
}

.folder-item.animated-outline {
    background: 
        linear-gradient(90deg, #227558 50%, transparent 50%), /* top */
        linear-gradient(90deg, #227558 50%, transparent 50%), /* bottom */
        linear-gradient(0deg, #227558 50%, transparent 50%),  /* left */
        linear-gradient(0deg, #227558 50%, transparent 50%);  /* right */
    background-repeat: repeat-x, repeat-x, repeat-y, repeat-y;
    background-size: 15px 2px, 15px 2px, 2px 15px, 2px 15px;
    background-position: 0 0, 0 100%, 0 0, 100% 0;
    animation: march 1s infinite linear !important;
}

@keyframes march {
    from {
        background-position: 0 0, 0 100%, 0 0, 100% 0;
    }
    to {
        background-position: 15px 0, -15px 100%, 0 -15px, 100% 15px;
    }
}
</style>
