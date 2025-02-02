<!-- src/routes/(app)/task-create/+page.svelte -->

<script>
    import { Card, Input, Label, Button, Radio } from "svelte-5-ui-lib";

    let formData = $state({
        notificationTitle: "",
        notificationContent: "",
        taskPriority: "normal",
        taskDeadline: "",
        taskStatus: "registered",
        taskMemo: "",
    });

    function handleSubmit(event) {
        event.preventDefault();
        const now = new Date().toISOString();

        const taskData = {
            taskCreationDateTime: { value: now },
            notificationTitle: { value: formData.notificationTitle },
            notificationContent: { value: formData.notificationContent },
            taskPriority: { value: formData.taskPriority },
            taskDeadline: { value: formData.taskDeadline },
            taskStatus: { value: formData.taskStatus },
            taskMemo: { value: formData.taskMemo },
            notificationDateTime: { value: "" },
            notificationSubtitle: { value: "" },
        };

        console.log("Form submitted:", taskData);
    }
</script>

<div class="pt-8 p-32">
    <Card class="max-w-none p-8 bg-moss_green-700">
        <h1 class="text-5xl font-bold mb-6 text-slate-700">Create New Task</h1>

        <form onsubmit={handleSubmit}>
            <div class="mb-6">
                <Label for="title" class="font-bold text-slate-700">Title</Label>
                <Input
                    type="text"
                    id="title"
                    bind:value={formData.notificationTitle}
                    required
                />
            </div>

            <div class="grid grid-cols-2 gap-4 mb-6">
                <div>
                    <Label for="content" class="font-bold text-slate-700">Content</Label>
                    <textarea
                        id="content"
                        bind:value={formData.notificationContent}
                        class="w-full p-2 border border-gray-300 rounded-lg"
                        rows="4"
                    ></textarea>
                </div>
                <div>
                    <Label for="memo" class="font-bold text-slate-700">Memo</Label>
                    <textarea
                        id="memo"
                        bind:value={formData.taskMemo}
                        class="w-full p-2 border border-gray-300 rounded-lg"
                        rows="4"
                    ></textarea>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-4 mb-6">
                <div>
                    <Label for="priority" class="mb-4 font-bold text-slate-700">Priority</Label>
                    <ul class="w-full items-center divide-x bg-white divide-slate-700 rounded-lg border border-gray-200 sm:flex">
                        {#each ["normal", "high", "urgent"] as priority}
                            <li class="w-full">
                                <Radio
                                    color="gray"
                                    name="priority"
                                    value={priority}
                                    bind:group={formData.taskPriority}
                                    labelClass="p-3"
                                >
                                    {priority}
                                </Radio>
                            </li>
                        {/each}
                    </ul>
                </div>
                <div>
                    <Label for="status" class="mb-4 font-bold text-slate-700">Status</Label>
                    <ul class="w-full items-center divide-x bg-white divide-gray-200 rounded-lg border border-gray-200 sm:flex">
                        {#each ["registered", "completed", "overdue"] as status}
                            <li class="w-full">
                                <Radio
                                    color="gray"
                                    name="status"
                                    value={status}
                                    bind:group={formData.taskStatus}
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
                    <Label for="assignee" class="font-bold text-slate-700">Assignee</Label>
                    <Input
                        type="text"
                        id="assignee"
                        value="Coming soon..."
                        disabled
                    />
                </div>
                <div>
                    <Label for="deadline" class="font-bold text-slate-700">Deadline</Label>
                    <div tabindex="-1" onblur={(e) => e.target.blur()}>
                        <Input
                            type="datetime-local"
                            id="deadline"
                            bind:value={formData.taskDeadline}
                            required
                            disabled
                        />
                    </div>
                </div>
            </div>

            <Button
                size="xl"
                type="submit"
                class="mt-8 w-full bg-thistle hover:bg-thistle-400 font-extrabold text-5xl text-slate-700 border hover:text-stone-200"
            >
                Create Task
            </Button>
        </form>
    </Card>
</div>