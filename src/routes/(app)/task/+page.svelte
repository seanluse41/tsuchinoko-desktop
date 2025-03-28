<!-- src/routes/(app)/task/+page.svelte -->
<script>
    import { page } from "$app/state";
    import { taskState } from "$lib/app/appTaskManager.svelte";
    import TaskDetailsCommands from "../../../components/TaskDetailsCommands.svelte";
    import TaskDetailsView from "../../../components/TaskDetailsView.svelte";
    import TaskDetailsEdit from "../../../components/TaskDetailsEdit.svelte";
    import { trackTaskAction } from "$lib/app/appNavigationTracker.svelte";
    import { Button } from "svelte-5-ui-lib";
    import { _ } from "svelte-i18n";
    import { preferencesState } from "$lib/app/appPreferences.svelte";

    // Get taskId from query parameter instead of route param
    let taskId = $derived(page.url.searchParams.get("id"));
    
    // Editing state
    let isEditing = $state(false);
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
    }
    
    // Save changes (we'll implement this later)
    function saveChanges() {
        // TODO: Implement saving logic
        console.log("Saving changes:", formData);
        isEditing = false;
    }
</script>

<main class="flex h-full select-enabled relative">
    <div class="md:w-64 flex-shrink-0">
        <TaskDetailsCommands taskId={task?.id} />
    </div>
    {#if task}
        <div class="flex-1 overflow-y-auto py-8 px-2 lg:p-8">
            {#if isEditing}
                <TaskDetailsEdit 
                    {task} 
                    bind:formData 
                    onSave={saveChanges} 
                    onCancel={toggleEditMode} 
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