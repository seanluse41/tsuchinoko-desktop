<!-- src/components/TaskCommands.svelte -->
<script>
    import {
        Sidebar,
        SidebarGroup,
        SidebarButton,
        uiHelpers,
    } from "svelte-5-ui-lib";
    import { goto } from "$app/navigation";
    import { taskState, allTasksCompleted } from "../lib/appTaskManager.svelte";
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