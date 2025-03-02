<!-- src/routes/(app)/task-create/+page.svelte -->
<script>
    import { Card, Input, Label, Button, Radio, Alert } from "svelte-5-ui-lib";
    import AirDatepicker from "air-datepicker";
    import localeJa from "air-datepicker/locale/ja";
    import "air-datepicker/air-datepicker.css";
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import { addRecord } from "$lib/kintone/kintoneAddRecord.svelte.js";
    import { trackNavigation, trackTaskAction } from "$lib/app/appNavigationTracker.svelte";

    let formData = $state({
        notificationTitle: "",
        notificationContent: "",
        taskPriority: "normal",
        taskDeadline: "",
        taskStatus: "registered",
        taskMemo: "",
    });

    let error = $state(null);
    let isSubmitting = $state(false);
    let dateInput;
    let datepicker;

    onMount(() => {
        trackTaskAction([], "view")
        datepicker = new AirDatepicker(dateInput, {
            timepicker: true,
            locale: localeJa,
            inline: false,
            position: "top left",
            onSelect({ date }) {
                // Use a function to update state instead of direct mutation
                updateDeadline(date?.toISOString() || "");
            },
        });
    });

    // Function to safely update the deadline
    function updateDeadline(newDate) {
        formData = {
            ...formData,
            taskDeadline: newDate,
        };
    }

    // Function to update form fields
    function updateFormField(field, value) {
        formData = {
            ...formData,
            [field]: value,
        };
    }

    async function handleSubmit(event) {
        event.preventDefault();
        if (isSubmitting) return;

        try {
            isSubmitting = true;
            error = null;
            const response = await addRecord(formData);
            trackNavigation("/home")
            goto("/home");
        } catch (err) {
            error = err.message || "Failed to create task. Please try again.";
            isSubmitting = false;
        }
    }
</script>

<div class="pt-8 p-32">
    <Card class="max-w-none bg-moss_green-700 relative p-10">
        <h1 class="text-5xl font-bold mb-6 text-slate-700">Create New Task</h1>

        {#if error}
            <Alert color="red" class="mb-4">{error}</Alert>
        {/if}

        <form onsubmit={handleSubmit} class="flex flex-col gap-4">
            <div class="mb-6">
                <Label for="title" class="font-bold text-slate-700">Title</Label
                >
                <Input
                    size="lg"
                    type="text"
                    id="title"
                    value={formData.notificationTitle}
                    onchange={(e) =>
                        updateFormField("notificationTitle", e.target.value)}
                    required
                />
            </div>

            <div class="grid grid-cols-2 gap-4 mb-6">
                <div>
                    <Label for="content" class="font-bold text-slate-700"
                        >Content</Label
                    >
                    <textarea
                        id="content"
                        value={formData.notificationContent}
                        onchange={(e) =>
                            updateFormField(
                                "notificationContent",
                                e.target.value,
                            )}
                        class="w-full p-2 border border-gray-300 rounded-lg"
                        rows="4"
                    ></textarea>
                </div>
                <div>
                    <Label for="memo" class="font-bold text-slate-700"
                        >Memo</Label
                    >
                    <textarea
                        id="memo"
                        value={formData.taskMemo}
                        onchange={(e) =>
                            updateFormField("taskMemo", e.target.value)}
                        class="w-full p-2 border border-gray-300 rounded-lg"
                        rows="4"
                    ></textarea>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-4 mb-6">
                <div>
                    <Label for="priority" class="mb-4 font-bold text-slate-700"
                        >Priority</Label
                    >
                    <ul
                        class="w-full items-center divide-x bg-white divide-slate-700 rounded-lg border border-gray-200 sm:flex"
                    >
                        {#each ["normal", "high", "urgent"] as priority}
                            <li class="w-full">
                                <Radio
                                    color="gray"
                                    name="priority"
                                    value={priority}
                                    checked={formData.taskPriority === priority}
                                    onclick={() =>
                                        updateFormField(
                                            "taskPriority",
                                            priority,
                                        )}
                                    labelClass="p-3"
                                >
                                    {priority}
                                </Radio>
                            </li>
                        {/each}
                    </ul>
                </div>
                <div>
                    <Label for="priority" class="mb-4 font-bold text-slate-700"
                        >Status</Label
                    >
                    <ul
                        class="w-full items-center divide-x bg-white divide-slate-700 rounded-lg border border-gray-200 sm:flex"
                    >
                        {#each ["registered", "completed", "overdue"] as status}
                            <li class="w-full">
                                <Radio
                                    color="gray"
                                    name="status"
                                    value={status}
                                    checked={formData.taskStatus === status}
                                    onclick={() =>
                                        updateFormField("taskStatus", status)}
                                    labelClass="p-3"
                                >
                                    {status}
                                </Radio>
                            </li>
                        {/each}
                    </ul>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-4 mb-6">
                <div>
                    <Label for="assignee" class="font-bold text-slate-700"
                        >Assignee</Label
                    >
                    <Input
                        type="text"
                        id="assignee"
                        value="Coming soon..."
                        disabled
                    />
                </div>
                <div>
                    <Label for="deadline" class="font-bold text-slate-700"
                        >Deadline</Label
                    >
                    <div tabindex="-1">
                        <input
                            bind:this={dateInput}
                            type="text"
                            id="deadline"
                            required
                            class="w-full p-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                </div>
            </div>

            <div class="w-full flex items-center justify-center">
                <Button
                    size="lg"
                    type="submit"
                    disabled={isSubmitting}
                    class="w-1/3 text-slate-700 font-bold rounded-lg border border-slate-700 p-4 hover:bg-slate-200 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? "Creating..." : "Create Task"}
                </Button>
            </div>
        </form>
    </Card>
</div>
