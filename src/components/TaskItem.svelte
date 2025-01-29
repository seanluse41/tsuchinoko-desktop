<!-- src/components/TaskItem.svelte -->
<script>
    import { Card, P, Heading, Listgroup, Hr } from "svelte-5-ui-lib";
    import { CheckCircleOutline } from "flowbite-svelte-icons";
    import { goto } from "$app/navigation";
    import { draggable } from '@thisux/sveltednd';
    import { taskState, toggleTaskSelection } from "$lib/appTaskManager.svelte";
    import { clearActiveFolderId } from "$lib/appTaskDragState.svelte";
    import { formatDate, getDueText } from "$lib/appDateHelpers.js";

    let { name, id, status, description, memo, dateCreated, dateDue } = $props();
    let isSelected = $derived(taskState.selectedTasks.includes(id));

    let statusItems = $derived([
        `Status: ${status}`,
        `Created: ${formatDate(dateCreated)}`,
        `Due: ${formatDate(dateDue)}`,
        getDueText(dateDue),
    ]);

    // Add dragEnd callback to clean up state
    function handleDragEnd() {
        clearActiveFolderId();
    }

    function handleClick(event) {
        if (event.ctrlKey || event.metaKey) {
            toggleTaskSelection(id);
        } else {
            taskState.selectedTasks = [];
            goto(`/task?id=${id}`);
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
                return "bg-moss_green-700";
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
                return "hover:bg-moss_green-500";
            case "registered":
                return "hover:bg-thistle-400";
            case "overdue":
                return "hover:bg-redwood-400";
            default:
                return "hover:bg-amber-400";
        }
    });

    const taskData = {
        id,
        name,
        status,
        description,
        memo,
        dateCreated,
        dateDue
    };
</script>

<div role="listitem" 
     oncontextmenu={handleRightClick}
     use:draggable={{ 
        container: "tasks", 
        dragData: taskData,
        callbacks: {
            onDragEnd: handleDragEnd
        }
     }}>
    <Card
        onclick={handleClick}
        padding="none"
        size="xl"
        class="flex flex-col {bgColor} {hoverColor} max-w-none border border-ebony-200 rounded-lg cursor-move px-4 py-6"
    >
        <!-- Card content unchanged -->
        <div class="flex gap-12">
            <div
                class="flex items-center justify-center h-10 w-10 min-w-8 mt-1 rounded-full border border-ebony-200 bg-white"
            >
                {#if isSelected}
                    <CheckCircleOutline class="h-8 w-8 text-moss_green-600" />
                {:else}
                    {id}
                {/if}
            </div>

            <div class="flex-1 max-w-full overflow-hidden">
                <Heading
                    tag="h3"
                    class="text-5xl font-bold mb-8 {isSelected
                        ? 'text-stone-200'
                        : 'text-slate-700'}">{name}</Heading
                >
                <P
                    class="mt-4 text-slate-700 line-clamp-1 {isSelected
                        ? 'text-stone-200'
                        : ''}">{description}</P
                >
                <Hr hrClass="mt-6 mb-2" />
                <P
                    class="text-slate-700 {isSelected
                        ? 'text-stone-200'
                        : ''} p-0 m-0">Memo:</P
                >
                <P
                    class="text-slate-700 line-clamp-1 {isSelected
                        ? 'text-stone-200'
                        : ''} p-0 m-0">{memo}</P
                >
            </div>

            <Listgroup
                items={statusItems}
                class={isSelected ? "text-slate-700" : ""}
                itemClass="border bg-transparent hover:bg-transparent p-4 font-bold"
            />
        </div>
    </Card>
</div>

<style>
    /* Add dragging styles */
    :global(.svelte-dnd-dragging) {
        opacity: 0.6;
        transform: scale(1.05);
        transition: transform 0.2s ease-in-out;
        user-select: none;
    }

    /* Prevent text selection during drag */
    div[role="listitem"] {
        user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
    }
</style>