<!-- src/components/TaskDetailsView.svelte -->
<script>
    import { Heading, P, Hr } from "svelte-5-ui-lib";
    import { formatDate, getDueText } from "$lib/app/appDateHelpers.js";
    import { _ } from "svelte-i18n";
    import { onMount } from "svelte";
    import AirDatepicker from "air-datepicker";
    import localeJa from "air-datepicker/locale/ja";
    import "air-datepicker/air-datepicker.css";
    import { preferencesState } from "$lib/app/appPreferences.svelte";

    let { task, currentLanguage } = $props();
    let calendarContainer = $state();
    let datepicker;

    onMount(() => {
        // Only initialize datepicker on desktop
        if (window.innerWidth >= 768 && calendarContainer && task.dateDue) {
            // Initialize with the task due date
            datepicker = new AirDatepicker(calendarContainer, {
                inline: true,
                locale: currentLanguage === "ja" ? localeJa : undefined,
                selectedDates: task.dateDue ? [new Date(task.dateDue)] : [],
                onSelect: () => {
                    // This is a read-only view, so we don't need to handle selection
                    return false;
                },
                // Disable selection
                onRenderCell: () => {
                    return {
                        disabled: true
                    };
                }
            });
        }

        return () => {
            // Clean up datepicker on component unmount
            if (datepicker) {
                datepicker.destroy();
            }
        };
    });
</script>

<div>
    <div class="flex items-center justify-between mb-4">
        <Heading class="text-5xl font-bold">{task.name}</Heading>
    </div>

    <div class="md:flex md:space-x-8">
        <div class="space-y-4 max-w-full md:w-1/2">
            <P>{$_("taskDetail.id")}: {task.id}</P>
            <P>{$_("taskDetail.status")}: {task.status}</P>
            <P>{$_("taskDetail.created")}: {formatDate(task.dateCreated, $_, currentLanguage)}</P>
            <P>{$_("taskDetail.due")}: {formatDate(task.dateDue, $_, currentLanguage)}</P>
            <P>{$_("taskDetail.dueIn")}: {getDueText(task.dateDue, $_, currentLanguage)}</P>
            <P>{$_("taskDetail.priority")}: {task.priority || 'normal'}</P>
            {#if task.folder}
                <P>{$_("taskDetail.folder")}: {task.folder}</P>
            {/if}
        </div>

        <!-- Calendar display - only visible on md screens and larger -->
        <div class="hidden md:block md:w-1/2">
            {#if task.dateDue}
                <div bind:this={calendarContainer} class="air-datepicker-calendar border md:max-w-64 lg:max-w-96 border-slate-200 rounded-lg p-2"></div>
            {:else}
                <div class="border border-slate-200 rounded-lg p-6 text-center bg-slate-50">
                    <P class="text-slate-500">{$_("dateHelpers.noDueDate")}</P>
                </div>
            {/if}
        </div>
    </div>

    <div class="mt-6">
        <P class="break-words">
            {$_("taskDetail.description")}:
            {task.description}
        </P>
        <P class="break-words mt-4">{$_("taskDetail.memo")}: {task.memo}</P>
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

<style>
    /* Custom styling for the calendar */
    :global(.air-datepicker-calendar .air-datepicker) {
        width: 100% !important;
        border: none !important;
        box-shadow: none !important;
    }

    :global(.air-datepicker-calendar .air-datepicker-nav) {
        border-bottom: 1px solid #e5e7eb;
        padding-bottom: 0.5rem;
    }

    :global(.air-datepicker-calendar .air-datepicker--day-name) {
        color: #64748b;
        font-weight: 500;
    }

    :global(.air-datepicker-calendar .air-datepicker--cell.-selected-) {
        background: #829650;
        color: white;
    }

    :global(.air-datepicker-calendar .air-datepicker--cell.-current-) {
        color: #9d6455;
    }
</style>