<!-- src/components/TaskDetailsCommands.svelte -->
<script>
    import {
        Sidebar,
        SidebarGroup,
        SidebarButton,
        uiHelpers,
    } from "svelte-5-ui-lib";
    import { goto } from "$app/navigation";
    import { updateTaskStatus } from "$lib/kintone/kintoneUpdateRecords.svelte";
    import { deleteRecords } from "$lib/kintone/kintoneDeleteRecords.svelte.js";
    import { taskState, allTasksCompleted } from "$lib/app/appTaskManager.svelte";
    import { preferencesState } from "$lib/app/appPreferences.svelte";
    import BackButton from "./TaskDetailsButtons/BackToHome.svelte";
    import AddToGroupButton from "./TaskDetailsButtons/AddToGroup.svelte";
    import CompleteButton from "./TaskDetailsButtons/CompleteTask.svelte";
    import ViewInKintoneButton from "./TaskDetailsButtons/ViewInKintone.svelte";
    import ViewNotificationButton from "./TaskDetailsButtons/ViewNotification.svelte";
    import CopyButton from "./TaskDetailsButtons/CopyToClipboard.svelte";
    import DeleteButton from "./TaskDetailsButtons/DeleteTask.svelte";
    import ConfirmDeleteModal from "./ConfirmDeleteModal.svelte";
    import ConfirmCompleteModal from "./ConfirmCompleteModal.svelte";
    import NoticeModal from "./NoticeModal.svelte";
    import { trackNavigation } from "$lib/app/appNavigationTracker.svelte";

    let { taskId } = $props();

    const sidebarUI = uiHelpers();
    const deleteModalUI = uiHelpers();
    const completeModalUI = uiHelpers();
    let isOpen = $state(true);
    const closeSidebar = sidebarUI.close;

    $effect(() => {
        isOpen = sidebarUI.isOpen;
        if (taskId) {
            taskState.selectedTasks = [taskId];
        }
    });

    const handleComplete = async (completionMemo = '') => {
        if (!allTasksCompleted(taskState.selectedTasks, taskState.tasks)) {
            try {
                await updateTaskStatus(completionMemo);
                trackNavigation("/home")
                goto("/home");
            } catch (err) {
                console.error("Failed to complete task:", err);
            }
        }
    };

    const handleDelete = async () => {
        try {
            await deleteRecords();
            trackNavigation("/home")
            goto("/home");
        } catch (err) {
            console.error("Failed to delete task:", err);
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
        class="z-10 h-full border-r-2 border-ebony"
        divClass="bg-transparent px-6 py-20 overflow-y-auto"
        style="background-color: {preferencesState.menuColor}"
    >
        <SidebarGroup>
            <BackButton />
            <AddToGroupButton />
            <CompleteButton modalUI={completeModalUI} {taskId} />
            <ViewInKintoneButton {taskId} />
            <ViewNotificationButton />
            <CopyButton />
            <DeleteButton modalUI={deleteModalUI} />
        </SidebarGroup>
    </Sidebar>
</div>

<ConfirmDeleteModal modalUI={deleteModalUI} onConfirm={handleDelete} />

{#if allTasksCompleted(taskState.selectedTasks, taskState.tasks)}
    <NoticeModal
        modalUI={completeModalUI}
        message="This task is already completed."
    />
{:else}
    <ConfirmCompleteModal
        modalUI={completeModalUI}
        onConfirm={handleComplete}
    />
{/if}