<!-- src/components/TaskCommands.svelte -->
<script>
    import {
        Sidebar,
        SidebarGroup,
        SidebarButton,
        uiHelpers,
        Modal,
    } from "svelte-5-ui-lib";
    import { goto } from "$app/navigation";
    import {
        taskState,
        allTasksCompleted,
    } from "$lib/app/appTaskManager.svelte";
    import { getDisplayTasks } from "$lib/app/appTaskFilters.svelte";
    import { dragState } from "$lib/app/appTaskDragState.svelte.js";
    import { updateTaskStatus } from "$lib/kintone/kintoneUpdateRecords.svelte";
    import { deleteRecords } from "$lib/kintone/kintoneDeleteRecords.svelte.js";
    import { changeTaskFolder } from "$lib/kintone/kintoneChangeFolder.svelte.js";
    import { dndState } from "@thisux/sveltednd";
    import ConfirmDeleteModal from "./ConfirmDeleteModal.svelte";
    import ConfirmCompleteModal from "./ConfirmCompleteModal.svelte";
    import NoticeModal from "./NoticeModal.svelte";
    import TaskFolder from "./HomeTaskButtons/TaskFolder.svelte";
    import AddFolder from "./HomeTaskButtons/AddFolder.svelte";
    import { folderState } from "$lib/app/appFolderManager.svelte.js";
    import { preferencesState } from "$lib/app/appPreferences.svelte";

    import FilterButton from "./HomeTaskButtons/FilterTasks.svelte";
    import SortButton from "./HomeTaskButtons/SortTasks.svelte";
    import SyncButton from "./HomeTaskButtons/SyncTasks.svelte";
    import SelectAllButton from "./HomeTaskButtons/SelectAllTasks.svelte";
    import CompleteButton from "./HomeTaskButtons/CompleteTasks.svelte";
    import DeleteButton from "./HomeTaskButtons/DeleteTasks.svelte";
    import { trackNavigation } from "$lib/app/appNavigationTracker.svelte";

    // Sidebar setup
    const sidebarUI = uiHelpers();
    const deleteModalUI = uiHelpers();
    const completeModalUI = uiHelpers();
    let isOpen = $state(true);
    const closeSidebar = sidebarUI.close;

    $effect(() => {
        isOpen = sidebarUI.isOpen;
    });

    // Task handling functions
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
                trackNavigation("/home");
                goto("/home");
            }
        } catch (err) {
            console.error("Failed to delete tasks:", err);
        }
    };

    function handleDrop(folderId, state) {
        const displayTasks = getDisplayTasks();
        const draggedTask = displayTasks[state.draggedItem.viewIndex];

        if (!draggedTask) {
            console.error("Could not find dragged task in current view");
            return;
        }

        // check if one or multiple drag
        const tasksToMove = taskState.selectedTasks.includes(draggedTask.id)
            ? taskState.selectedTasks
            : [draggedTask.id];

        const targetFolderValue = folderId === "All" ? "" : folderId;

        // Skip if trying to move to the same folder
        const allTasksAlreadyInFolder = tasksToMove.every((id) => {
            const task = taskState.tasks.find((t) => t.id === id);
            const currentFolder = task?.folder || "";
            return currentFolder === targetFolderValue;
        });

        if (allTasksAlreadyInFolder) {
            return;
        }

        // Call the changeTaskFolder function
        changeTaskFolder("16", tasksToMove, targetFolderValue)
            .then(() => {
                console.log("Tasks moved successfully");
            })
            .catch((err) => {
                console.error("Failed to move tasks:", err);
            });
    }

    let shouldShowGroupOutline = $derived(
        dndState.isDragging && !dragState.activeFolderId,
    );
</script>

<div class="relative">
    <SidebarButton onclick={sidebarUI.toggle} class="mb-2" />
    <Sidebar
        isSingle={false}
        backdrop={false}
        {isOpen}
        {closeSidebar}
        class="z-10 h-full border-r-2 border-ebony"
        divClass="bg-transparent px-6 py-20 overflow-y-auto"
        style="background-color: {preferencesState.menuColor}"
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
                class={shouldShowGroupOutline
                    ? "folder-group-outline flex flex-col gap-4 mb-4"
                    : "flex flex-col gap-4 mb-4"}
            >
                {#each folderState.folders as folderId}
                    <TaskFolder
                        {folderId}
                        label={folderId}
                        onDrop={handleDrop}
                    />
                {/each}
            </div>
            <AddFolder />
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
    .folder-group-outline {
        outline: 2px dashed #227558;
        outline-offset: 10px;
        animation: march 1s linear infinite;
    }

    @keyframes march {
        0% {
            outline-offset: 10px;
            outline-style: dashed;
        }
        49% {
            outline-style: dashed;
        }
        50% {
            outline-style: dotted;
        }
        99% {
            outline-style: dotted;
        }
        100% {
            outline-offset: 10px;
            outline-style: dashed;
        }
    }
</style>
