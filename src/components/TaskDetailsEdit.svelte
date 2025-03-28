<!-- src/components/TaskDetailsEdit.svelte -->
<script>
    import {
        Input,
        Textarea,
        Select,
        Radio,
        Button,
        Label,
        Spinner,
    } from "svelte-5-ui-lib";
    import { _ } from "svelte-i18n";
    import { onMount } from "svelte";
    import AirDatepicker from "air-datepicker";
    import localeJa from "air-datepicker/locale/ja";
    import "air-datepicker/air-datepicker.css";
    import { taskState } from "$lib/app/appTaskManager.svelte";

    let { task, formData, onSave, onCancel, isSubmitting = false } = $props();

    // For date picker
    let dateInput;
    let datepicker;

    // Initialize date picker
    function initializeDatepicker() {
        if (dateInput) {
            // Destroy previous instance if exists
            if (datepicker) {
                datepicker.destroy();
            }

            // Create new instance
            datepicker = new AirDatepicker(dateInput, {
                timepicker: true,
                locale: localeJa,
                inline: false,
                position: "top left",
                selectedDates: formData.dateDue
                    ? [new Date(formData.dateDue)]
                    : [],
                onSelect({ date }) {
                    formData.dateDue = date?.toISOString() || "";
                },
            });
        }
    }

    // Initialize on mount
    onMount(() => {
        setTimeout(() => {
            initializeDatepicker();
        }, 0);

        return () => {
            if (datepicker) {
                datepicker.destroy();
            }
        };
    });

    // Available folders for selection
    let availableFolders = $derived([
        ...new Set(taskState.tasks.map((t) => t.folder).filter(Boolean)),
    ]);
</script>

<div class="space-y-6 max-w-2xl">
    <div>
        <Label for="task-name" class="font-bold text-slate-700"
            >{$_("taskDetail.name")}</Label
        >
        <Input
            id="task-name"
            type="text"
            bind:value={formData.name}
            class="w-full mt-1"
            disabled={isSubmitting}
        />
    </div>

    <!-- Grid layout for desktop, column layout for mobile -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <p class="mb-2 font-bold text-slate-700">
                {$_("taskDetail.status")}
            </p>
            <!-- Flex column on mobile, row on desktop -->
            <div class="flex flex-col md:flex-row gap-1 md:gap-4">
                {#each ["registered", "completed", "overdue"] as status}
                    <Radio
                        name="status"
                        value={status}
                        checked={formData.status === status}
                        onclick={() => (formData.status = status)}
                        labelClass="w-auto m-2"
                        disabled={isSubmitting}>{status}</Radio
                    >
                {/each}
            </div>
        </div>

        <div>
            <p class="mb-2 font-bold text-slate-700">
                {$_("taskDetail.priority")}
            </p>
            <!-- Flex column on mobile, row on desktop -->
            <div class="flex flex-col md:flex-row gap-1 md:gap-4">
                {#each ["normal", "high", "urgent"] as priority}
                    <Radio
                        name="priority"
                        value={priority}
                        checked={formData.priority === priority}
                        onclick={() => (formData.priority = priority)}
                        labelClass="w-auto m-2"
                        disabled={isSubmitting}>{priority}</Radio
                    >
                {/each}
            </div>
        </div>
    </div>

    <div>
        <Label for="task-due" class="font-bold text-slate-700"
            >{$_("taskDetail.due")}</Label
        >
        <div class="mt-1" tabindex="-1">
            <input
                bind:this={dateInput}
                type="text"
                id="task-due"
                class="w-full p-2 border border-gray-300 rounded-lg cursor-pointer {isSubmitting
                    ? 'opacity-70 cursor-not-allowed'
                    : ''}"
                placeholder={$_("taskDetail.selectDate")}
                disabled={isSubmitting}
            />
        </div>
    </div>

    <div>
        <Label for="task-folder" class="font-bold text-slate-700"
            >{$_("taskDetail.folder")}</Label
        >
        <Select
            id="task-folder"
            bind:value={formData.folder}
            class="w-full mt-1"
            disabled={isSubmitting}
        >
            <option value="All">{$_("taskDetail.noFolder")}</option>
            {#each availableFolders as folder}
                {#if folder}
                    <option value={folder}>{folder}</option>
                {/if}
            {/each}
        </Select>
    </div>

    <div>
        <Label for="task-description" class="font-bold text-slate-700"
            >{$_("taskDetail.description")}</Label
        >
        <Textarea
            id="task-description"
            bind:value={formData.description}
            class="w-full mt-1"
            rows="4"
            disabled={isSubmitting}
        />
    </div>

    <div>
        <Label for="task-memo" class="font-bold text-slate-700"
            >{$_("taskDetail.memo")}</Label
        >
        <Textarea
            id="task-memo"
            bind:value={formData.memo}
            class="w-full mt-1"
            rows="4"
            disabled={isSubmitting}
        />
    </div>

    {#if formData.status === "completed"}
        <div>
            <Label for="task-completion-memo" class="font-bold text-slate-700"
                >{$_("taskDetail.completionNotes")}</Label
            >
            <Textarea
                id="task-completion-memo"
                bind:value={formData.completionMemo}
                class="w-full mt-1"
                rows="4"
                disabled={isSubmitting}
            />
        </div>
    {/if}

    <div class="flex flex-col sm:flex-row gap-4 pt-4">
        <Button
            onclick={onSave}
            class="bg-moss_green hover:bg-moss_green-700 text-white"
            disabled={isSubmitting}
        >
            {#if isSubmitting}
                <Spinner class="mr-2" size="4" color="teal" />
                {$_("taskDetail.saving")}
            {:else}
                {$_("taskDetail.saveChanges")}
            {/if}
        </Button>
        <Button
            onclick={onCancel}
            class="bg-thistle hover:bg-thistle-700"
            disabled={isSubmitting}
        >
            {$_("taskDetail.cancel")}
        </Button>
    </div>
</div>
