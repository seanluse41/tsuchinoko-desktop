<!-- src/routes/(app)/task/+page.svelte -->
<script>
    import { page } from "$app/state";
    import { taskState } from "$lib/app/appTaskManager.svelte";
    import TaskDetailsCommands from "../../../components/TaskDetailsCommands.svelte";
    import TaskDetailsView from "../../../components/TaskDetailsView.svelte";
    import TaskDetailsEdit from "../../../components/TaskDetailsEdit.svelte";
    import { trackTaskAction } from "$lib/app/appNavigationTracker.svelte";
    import { Button, Alert } from "svelte-5-ui-lib";
    import { _ } from "svelte-i18n";
    import { preferencesState } from "$lib/app/appPreferences.svelte";
    import { updateTask } from "$lib/kintone/kintoneUpdateTask.svelte.js";

    // Get taskId from query parameter instead of route param
    let taskId = $derived(page.url.searchParams.get("id"));
    
    // Editing state
    let isEditing = $state(false);
    let isSubmitting = $state(false);
    let errorMessage = $state('');
    let formData = $state({
        name: '',
        status: '',
        dateDue: '',
        description: '',
        memo: '',
        priority: '',
        completionMemo: '',
        folder: ''
    });

    $effect(() => {  
        if (taskId) {
            taskState.selectedTasks = [taskId];
        }
        trackTaskAction([taskId], "view")
    });

    // Always get the latest task data directly from the tasks array
    let task = $derived(taskState.tasks.find((t) => t.id === taskId));
    let currentLanguage = $derived(preferencesState.language);
    
    // Initialize form data when task changes
    $effect(() => {
        if (task) {
            formData = {
                name: task.name || '',
                status: task.status || '',
                dateDue: task.dateDue || '',
                description: task.description || '',
                memo: task.memo || '',
                priority: task.priority || 'normal',
                completionMemo: task.completionMemo || '',
                folder: task.folder || ''
            };
        }
    });
    
    // Toggle edit mode
    function toggleEditMode() {
        isEditing = !isEditing;
        errorMessage = '';
    }
    
    // Save changes
    async function saveChanges() {
        if (!task || !taskId) return;
        
        try {
            isSubmitting = true;
            errorMessage = '';
            
            // Map form data fields to Kintone field names
            const kintoneFields = {
                notificationTitle: formData.name,
                taskStatus: formData.status,
                taskDeadline: formData.dateDue,
                notificationContent: formData.description,
                taskMemo: formData.memo,
                taskPriority: formData.priority,
                taskCompletionMemo: formData.completionMemo,
                taskFolder: formData.folder === "All" ? "" : formData.folder
            };
            
            // Update the task
            await updateTask(taskId, kintoneFields, 'edit');
            
            // Exit edit mode
            isEditing = false;
        } catch (err) {
            console.error("Failed to save task:", err);
            errorMessage = err.message || $_("taskDetail.saveFailed");
        } finally {
            isSubmitting = false;
        }
    }
</script>

<main class="flex h-full select-enabled">
    <div class="w-64 flex-shrink-0">
        <TaskDetailsCommands taskId={task?.id} />
    </div>
    {#if task}
        <div class="flex-1 overflow-y-auto p-8 z-10">
            {#if errorMessage}
                <Alert color="red" class="mb-4">{errorMessage}</Alert>
            {/if}
            
            {#if isEditing}
                <TaskDetailsEdit 
                    {task} 
                    bind:formData 
                    onSave={saveChanges} 
                    onCancel={toggleEditMode}
                    {isSubmitting}
                />
            {:else}
                <div class="flex items-center justify-between mb-4">
                    <div></div> <!-- Spacer -->
                    <Button 
                        onclick={toggleEditMode}
                        class="bg-thistle hover:bg-thistle-700"
                    >
                        {$_("taskDetail.edit")}
                    </Button>
                </div>
                <TaskDetailsView {task} {currentLanguage} />
            {/if}
        </div>
    {:else}
        <div class="p-8">
            <p>{$_("taskDetail.taskNotFound")}</p>
        </div>
    {/if}
</main>