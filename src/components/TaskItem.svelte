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

    let bgColor = $derived.by(() => {
        if (isSelected) {
            switch (status) {
                case "completed":
                    return "bg-moss_green-300";
                case "registered":
                    return "bg-thistle-300";
                case "overdue":
                    return "bg-redwood-300";
                default:
                    return "bg-amber-300";
            }
        }
        switch (status) {
            case "completed":
                return "bg-moss_green";
            case "registered":
                return "bg-thistle";
            case "overdue":
                return "bg-redwood";
            default:
                return "bg-amber";
        }
    });

    let hoverColor = $derived.by(() => {
        if (isSelected) {
            switch (status) {
                case "completed":
                    return "hover:bg-moss_green-200";
                case "registered":
                    return "hover:bg-thistle-200";
                case "overdue":
                    return "hover:bg-redwood-200";
                default:
                    return "hover:bg-amber-200";
            }
        }
        switch (status) {
            case "completed":
                return "hover:bg-moss_green-400";
            case "registered":
                return "hover:bg-thistle-400";
            case "overdue":
                return "hover:bg-redwood-400";
            default:
                return "hover:bg-amber-400";
        }
    });
</script>

<div role="listitem" oncontextmenu={handleRightClick}>
    <Card
        onclick={handleClick}
        padding="none"
        size="xl"
        class="flex flex-col {bgColor} {hoverColor} max-w-none border border-ebony-200 rounded-lg cursor-pointer px-4 py-8"
    >
        <div class="flex gap-12">
            <div
                class="flex items-center justify-center h-8 w-8 min-w-8 rounded-full border border-ebony-200 bg-white"
            >
                {#if isSelected}
                    <CheckCircleOutline class="h-5 w-5 text-moss_green-600" />
                {:else}
                    {id}
                {/if}
            </div>

            <div class="flex-1 min-w-0">
                <Heading
                    tag="h3"
                    class="text-4xl font-bold mb-1 truncate {isSelected
                        ? 'text-stone-200'
                        : 'text-slate-700'}">{name}</Heading
                >
                <P class="truncate mt-4 {isSelected ? 'text-stone-200' : ''}"
                    >{description}</P
                >
            </div>

            <div
                class="flex flex-col items-end text-sm py-8 {isSelected
                    ? 'text-white'
                    : ''}"
            >
                <P class="m-0">Status: {status}</P>
                <P class="m-0">Created: {dateCreated}</P>
                <P class="m-0">Due: {dateDue}</P>
            </div>
        </div>
    </Card>
</div>
