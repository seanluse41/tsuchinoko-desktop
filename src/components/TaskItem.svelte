<!-- src/components/TaskItem.svelte -->
<script>
    import { Card, P, Heading } from "svelte-5-ui-lib";
    import { CheckCircleOutline } from "flowbite-svelte-icons";
    import { goto } from "$app/navigation";
    import { taskState, toggleTaskSelection } from "$lib/appTaskManager.svelte";

    let { name, id, status, description, dateCreated, dateDue } = $props();
    let isSelected = $derived(taskState.selectedTasks.includes(id));

    function handleClick(event) {
        if (event.ctrlKey || event.metaKey) {
            toggleTaskSelection(id);
        } else {
            taskState.selectedTasks = [];
            goto(`/task/${id}`);
        }
    }

    function handleRightClick(event) {
        event.preventDefault();
        toggleTaskSelection(id);
    }

    let bgColor = $derived(
        isSelected
            ? status === "completed"
                ? "bg-moss_green-300"
                : status === "registered"
                  ? "bg-thistle-300"
                  : status === "overdue"
                    ? "bg-redwood-300"
                    : "bg-amber-300"
            : status === "completed"
              ? "bg-moss_green"
              : status === "registered"
                ? "bg-thistle"
                : status === "overdue"
                  ? "bg-redwood"
                  : "bg-amber",
    );

    let hoverColor = $derived(
        isSelected
            ? status === "completed"
                ? "hover:bg-moss_green-200"
                : status === "registered"
                  ? "hover:bg-thistle-200"
                  : status === "overdue"
                    ? "hover:bg-redwood-200"
                    : "hover:bg-amber-200"
            : status === "completed"
              ? "hover:bg-moss_green-400"
              : status === "registered"
                ? "hover:bg-thistle-400"
                : status === "overdue"
                  ? "hover:bg-redwood-400"
                  : "hover:bg-amber-400",
    );
</script>

<div role="listitem" oncontextmenu={handleRightClick}>
    <Card
        onclick={handleClick}
        padding="none"
        size="lg"
        class="flex flex-col {bgColor} {hoverColor} mb-3 max-w-none border border-ebony-200 rounded-lg cursor-pointer"
    >
        <div class="p-4">
            <div class="flex gap-6">
                <div
                    class="flex items-center justify-center h-8 w-8 min-w-8 rounded-full border border-ebony-200 bg-white"
                >
                    {#if isSelected}
                        <CheckCircleOutline
                            class="h-5 w-5 text-moss_green-600"
                        />
                    {:else}
                        {id}
                    {/if}
                </div>

                <div class="flex-1">
                    <Heading tag="h3" class="text-2xl font-bold mb-1"
                        >{name}</Heading
                    >
                    <P class="truncate">{description}</P>
                </div>

                <div class="flex flex-col items-end text-sm">
                    <P class="m-0">Status: {status}</P>
                    <P class="m-0">Created: {dateCreated}</P>
                    <P class="m-0">Due: {dateDue}</P>
                </div>
            </div>
        </div>
    </Card>
</div>
