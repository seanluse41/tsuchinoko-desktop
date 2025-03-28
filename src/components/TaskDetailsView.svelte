<!-- src/components/TaskDetailsView.svelte -->
<script>
    import { Heading, P, Hr } from "svelte-5-ui-lib";
    import { formatDate, getDueText } from "$lib/app/appDateHelpers.js";
    import { _ } from "svelte-i18n";

    let { task, currentLanguage } = $props();
</script>

<div>
    <div class="flex items-center justify-between mb-4">
        <Heading class="text-5xl font-bold">{task.name}</Heading>
    </div>
    <div class="space-y-4 max-w-full">
        <P>{$_("taskDetail.id")}: {task.id}</P>
        <P>{$_("taskDetail.status")}: {task.status}</P>
        <P>{$_("taskDetail.created")}: {formatDate(task.dateCreated, $_, currentLanguage)}</P>
        <P>{$_("taskDetail.due")}: {formatDate(task.dateDue, $_, currentLanguage)}</P>
        <P>{$_("taskDetail.dueIn")}: {getDueText(task.dateDue, $_, currentLanguage)}</P>
        <P>{$_("taskDetail.priority")}: {task.priority || 'normal'}</P>
        {#if task.folder}
            <P>{$_("taskDetail.folder")}: {task.folder}</P>
        {/if}
        <P class="break-words">
            {$_("taskDetail.description")}:
            {task.description}
        </P>
        <P class="break-words">{$_("taskDetail.memo")}: {task.memo}</P>
        <Hr />
        {#if task.status === 'completed'}
            <div class="p-4 bg-moss_green-500 border border-slate-700 rounded-lg mt-4">
                <Heading class="font-medium text-white">{$_("taskDetail.completionNotes")}:</Heading>
                <Hr class="mb-8 mt-4" />
                <P class="break-words text-white">{task.completionMemo}</P>
            </div>
        {/if}
    </div>
</div>