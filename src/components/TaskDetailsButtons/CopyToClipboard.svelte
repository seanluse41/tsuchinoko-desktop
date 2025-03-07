<!-- src/components/TaskDetailsButtons/CopyToClipboard.svelte -->
<script>
    import { SidebarItem } from "svelte-5-ui-lib";
    import { FileCopyOutline } from "flowbite-svelte-icons";
    import { writeText } from "@tauri-apps/plugin-clipboard-manager";
    import { taskState } from "$lib/app/appTaskManager.svelte";
    import { _ } from "svelte-i18n";

    const formatText = (selectedTask) => {
        if (!selectedTask) return "";

        return `Task: ${selectedTask.name}
ID: ${selectedTask.id}
Status: ${selectedTask.status}
Link: ${selectedTask.link}
Created: ${selectedTask.dateCreated}
${selectedTask.folder ? `Folder: ${selectedTask.folder}` : ""}`;
    };

    const copyToClipboard = async () => {
        const selectedTask = taskState.tasks.find(
            (task) => task.id === taskState.selectedTasks[0],
        );
        if (!selectedTask) return;

        const formattedText = formatText(selectedTask);
        await writeText(formattedText);
    };
</script>

<SidebarItem
    label={$_('taskDetailsButtons.copyToClipboard')}
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
