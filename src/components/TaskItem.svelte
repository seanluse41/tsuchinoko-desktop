<!-- src/components/TaskItem.svelte -->
<script>
    import { Card, P, Heading, Listgroup, Hr } from "svelte-5-ui-lib";
    import { CheckCircleOutline } from "flowbite-svelte-icons";
    import { goto } from "$app/navigation";
    import { dndState, draggable } from "@thisux/sveltednd";
    import {
        taskState,
        toggleTaskSelection,
    } from "$lib/app/appTaskManager.svelte";
    import { clearActiveFolderId } from "$lib/app/appTaskDragState.svelte";
    import { formatDate, getDueText } from "$lib/app/appDateHelpers.js";
    import { getDisplayTasks } from "$lib/app/appTaskFilters.svelte";
    import {
        trackNavigation,
        navigationState,
    } from "$lib/app/appNavigationTracker.svelte.js";

    let { name, id, status, description, memo, dateCreated, dateDue } =
        $props();
    let isSelected = $derived(taskState.selectedTasks.includes(id));
    let isDragging = $state(false);
    let mouseX = $state(0);
    let mouseY = $state(0);

    // Track if any drag operation is happening
    let isAnyDragging = $derived(dndState.isDragging);
    // Should show faded if this task is selected and there's a drag happening
    // For the dragged task OR selected tasks when dragging a selected task
    let shouldFade = $derived(
        isDragging ||
            (isSelected &&
                isAnyDragging &&
                taskState.selectedTasks.includes(dndState.draggedItem?.id)),
    );

    let wasJustCreated = $derived(
        navigationState.latestAction === "create" &&
            navigationState.latestTaskId?.includes(id) &&
            navigationState.navigationStack[0]?.path === "/home" &&
            navigationState.navigationStack[1]?.path === "/task-create",
    );

    let statusItems = $derived([
        `Status: ${status}`,
        `Created: ${formatDate(dateCreated)}`,
        `Due: ${formatDate(dateDue)}`,
        getDueText(dateDue),
    ]);

    $effect(() => {
        if (isDragging) {
            const updatePosition = (e) => {
                mouseX = e.clientX;
                mouseY = e.clientY;
            };
            window.addEventListener("dragover", updatePosition);
            return () => window.removeEventListener("dragover", updatePosition);
        }
    });

    function handleDragStart(event) {
        isDragging = true;
        mouseX = event.clientX;
        mouseY = event.clientY;
    }

    function handleDragEnd() {
        isDragging = false;
        clearActiveFolderId();
    }

    function handleClick(event) {
        if (event.ctrlKey || event.metaKey) {
            toggleTaskSelection(id);
        } else {
            taskState.selectedTasks = [];
            trackNavigation(`/task?id=${id}`);
            goto(`/task?id=${id}`);
        }
    }

    function handleRightClick(event) {
        event.preventDefault();
        toggleTaskSelection(id);
    }

    let bgColor = $derived.by(() => {
        if (isDragging && isSelected) {
            switch (status) {
                case "completed":
                    return "bg-moss_green-600";
                case "registered":
                    return "bg-thistle-600";
                case "overdue":
                    return "bg-redwood-600";
                default:
                    return "bg-amber-600";
            }
        }
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
        if (isDragging && isSelected) {
            switch (status) {
                case "completed":
                    return "hover:bg-moss_green-500";
                case "registered":
                    return "hover:bg-thistle-500";
                case "overdue":
                    return "hover:bg-redwood-500";
                default:
                    return "hover:bg-amber-500";
            }
        }
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

    let selectedCount = $derived(taskState.selectedTasks.length);
    let showBadge = $derived(isDragging && isSelected && selectedCount > 1);

    const currentViewIndex = getDisplayTasks().findIndex((t) => t.id === id);

    const taskData = {
        id,
        viewIndex: currentViewIndex,
        name,
        status,
        description,
        memo,
        dateCreated,
        dateDue,
    };
</script>

<div
    role="listitem"
    oncontextmenu={handleRightClick}
    use:draggable={{
        container: "tasks",
        dragData: taskData,
        callbacks: {
            onDragStart: handleDragStart,
            onDragEnd: handleDragEnd,
        },
        attributes: {
            draggingClass: "animate-wiggle",
        },
    }}
>
<Card
    onclick={handleClick}
    padding="none"
    size="xl"
    class="flex flex-col {bgColor} {hoverColor} max-w-none border border-ebony-200 rounded-lg cursor-move px-4 py-6 relative {shouldFade
        ? 'opacity-50'
        : ''} {wasJustCreated ? 'animate-wiggle' : ''}"
>
        <div class="flex gap-12">
            <div
                class="flex items-center justify-center h-10 w-10 min-w-8 mt-1 rounded-full border border-slate-700 bg-white"
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
                        : 'text-slate-700'}"
                >
                    {name}
                </Heading>
                <P
                    class="mt-4 text-slate-700 line-clamp-1 {isSelected
                        ? 'text-stone-200'
                        : ''}"
                >
                    {description}
                </P>
                <Hr hrClass="mt-6 mb-2" />
                <P
                    class="text-slate-700 {isSelected
                        ? 'text-stone-200'
                        : ''} p-0 m-0"
                >
                    Memo:
                </P>
                <P
                    class="text-slate-700 line-clamp-1 {isSelected
                        ? 'text-stone-200'
                        : ''} p-0 m-0"
                >
                    {memo}
                </P>
            </div>

            <Listgroup
                items={statusItems}
                class={isSelected ? "text-slate-700" : ""}
                itemClass="border bg-transparent hover:bg-transparent p-4 font-bold"
            />
        </div>
    </Card>
</div>

{#if showBadge}
    <div
        class="fixed z-[9999] bg-moss_green-600 text-white rounded-full w-8 h-8 flex items-center justify-center border-2 border-slate-700 pointer-events-none"
        style="left: {mouseX + 20}px; top: {mouseY -
            10}px; transform: translate(0, 0);"
    >
        {selectedCount}
    </div>
{/if}

<style>
    :global(.svelte-dnd-dragging) {
        opacity: 0.5;
        transform: scale(1.05);
        transition: all 0.2s ease-in-out;
        user-select: none;
        pointer-events: none;
    }

    div[role="listitem"] {
        user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
    }
</style>
