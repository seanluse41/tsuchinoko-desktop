<!-- src/components/TaskDetailsButtons/ViewNotification.svelte -->
<script>
    import { SidebarItem } from "svelte-5-ui-lib";
    import { BellRingOutline } from "flowbite-svelte-icons";
    import { open } from "@tauri-apps/plugin-shell";
    import { taskState } from "$lib/app/appTaskManager.svelte";
    import { _ } from "svelte-i18n";

    // Get the currently selected task (first item in selectedTasks array)
    let currentTask = $derived(
        taskState.selectedTasks.length > 0 
        ? taskState.tasks.find(t => t.id === taskState.selectedTasks[0]) 
        : null
    );
    // Check if the task has a notification URL
    let hasNotificationUrl = $derived(
        currentTask && currentTask.url && currentTask.url.trim() !== ''
    );

    const viewNotification = async () => {
        if (!hasNotificationUrl || !currentTask) return;
        
        try {
            await open(currentTask.url);
        } catch (error) {
            console.error("Failed to open notification URL:", error);
        }
    };
</script>

<SidebarItem
    label={$_("taskDetailsButtons.viewNotification")}
    onclick={hasNotificationUrl ? viewNotification : undefined}
    class="cursor-pointer mb-3 {!hasNotificationUrl ? 'opacity-50' : ''}"
    activeClass="flex items-center text-base font-normal text-gray-900 rounded-lg border border-ebony-200 p-3 {hasNotificationUrl ? 'hover:bg-thistle-800' : 'cursor-not-allowed'} bg-white"
    nonActiveClass="flex items-center text-base font-normal text-gray-900 rounded-lg border border-ebony-200 p-3 {hasNotificationUrl ? 'hover:bg-thistle-800' : 'cursor-not-allowed'} bg-white"
>
    {#snippet iconSlot()}
        <BellRingOutline
            class="h-5 w-5 text-ebony-600 transition-colors {hasNotificationUrl ? 'hover:text-moss_green-600' : ''}"
        />
    {/snippet}
</SidebarItem>