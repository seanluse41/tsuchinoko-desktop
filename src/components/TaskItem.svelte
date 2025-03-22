<!-- src/components/TaskItem.svelte -->
<script>
    import { Card, P, Heading, Listgroup, Hr, Badge } from "svelte-5-ui-lib";
    import { CheckCircleOutline } from "flowbite-svelte-icons";
    import { goto } from "$app/navigation";
    import { dndState, draggable } from "@thisux/sveltednd";
    import { _ } from "svelte-i18n";
    import {
        taskState,
        toggleTaskSelection,
        isNewTask
    } from "$lib/app/appTaskManager.svelte";
    import { clearActiveFolderId } from "$lib/app/appTaskDragState.svelte";
    import { formatDate, getDueText } from "$lib/app/appDateHelpers.js";
    import { getDisplayTasks } from "$lib/app/appTaskFilters.svelte";
    import {
        trackNavigation,
        navigationState,
    } from "$lib/app/appNavigationTracker.svelte.js";
    import { preferencesState } from "$lib/app/appPreferences.svelte";
    import {
        getTaskBackgroundColor,
        getTaskHoverColor,
        getTaskTextColor
    } from "$lib/app/appColorHelpers.svelte.js";

    let { name, id, status, description, memo, dateCreated, dateDue } =
        $props();
    let isSelected = $derived(taskState.selectedTasks.includes(id));
    let isDragging = $state(false);
    let mouseX = $state(0);
    let mouseY = $state(0);
    let isHovered = $state(false);

    let isAnyDragging = $derived(dndState.isDragging);
    let shouldFade = $derived(
        isDragging ||
            (isSelected &&
                isAnyDragging &&
                taskState.selectedTasks.includes(dndState.draggedItem?.id))
    );

    // Check if task was newly created through task creator
    let wasJustCreated = $derived(
        navigationState.latestAction === "create" &&
            navigationState.latestTaskId?.includes(id) &&
            navigationState.navigationStack[0]?.path === "/home" &&
            navigationState.navigationStack[1]?.path === "/task-create"
    );
    
    // Check if task is newly synced
    let isNewlySynced = $derived(isNewTask(id));
    
    // Apply wiggle if either condition is true
    let shouldWiggle = $derived(wasJustCreated || isNewlySynced);

    // Get current language from preferences
    let currentLanguage = $derived(preferencesState.language);

    let statusItems = $derived([
        `${$_("taskItem.status")}: ${status}`,
        `${$_("taskItem.created")}: ${formatDate(dateCreated, $_, currentLanguage)}`,
        `${$_("taskItem.due")}: ${formatDate(dateDue, $_, currentLanguage)}`,
        getDueText(dateDue, $_, currentLanguage),
    ]);
    
    // Get the current background color based on hover and other states
    let currentBgColor = $derived(
        isHovered 
            ? getTaskHoverColor(status, isSelected, isDragging) 
            : getTaskBackgroundColor(status, isSelected, isDragging)
    );
    
    // Get text color based on selection state
    let textColor = $derived(getTaskTextColor(isSelected));

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
    onmouseenter={() => isHovered = true}
    onmouseleave={() => isHovered = false}
    class="task-card flex flex-col max-w-none border border-ebony-200 rounded-lg cursor-move px-4 py-6 relative {shouldFade
        ? 'opacity-50'
        : ''} {shouldWiggle ? 'animate-wiggle' : ''}"
    style="background-color: {currentBgColor};"
>
        <div class="flex gap-4 lg:gap-12">
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
                    class="text-2xl lg:text-5xl font-bold lg:mb-8 sm:truncate"
                    style="color: {textColor};"
                >
                    {name}
                </Heading>
                <P
                    class="mt-2 lg:mt-4 line-clamp-1"
                    style="color: {textColor};"
                >
                    {description}
                </P>
                <Hr hrClass="mt-2 lg:mt-6 mb-2" />
                <P
                    class="p-0 m-0 lg:block hidden"
                    style="color: {textColor};"
                >
                    {$_("taskItem.memo")}:
                </P>
                <P
                    class="line-clamp-1 p-0 m-0 lg:block hidden"
                    style="color: {textColor};"
                >
                    {memo}
                </P>

                <!-- Mobile: Memo on one line -->
                <P class="p-0 m-0 lg:hidden inline" style="color: {textColor};">
                    {$_("taskItem.memo")}: <span class="line-clamp-1 inline">{memo}</span>
                </P>
                
                <!-- Mobile badges for status, date, etc. -->
                <div class="flex flex-wrap gap-2 mt-4 lg:hidden">
                    <Badge color={status === "completed" ? "green" : status === "overdue" ? "red" : "yellow"}>
                        {status}
                    </Badge>
                    <Badge color="blue">
                        {formatDate(dateCreated, $_, currentLanguage).split(' ')[0]}
                    </Badge>
                    <Badge color="purple">
                        {getDueText(dateDue, $_, currentLanguage)}
                    </Badge>
                </div>
            </div>

            <Listgroup
                items={statusItems}
                class="bg-white hidden lg:block"
                itemClass="border bg-transparent hover:bg-transparent p-4 font-bold hover:text-slate-700"
            />
        </div>
</Card>
</div>

{#if showBadge}
    <div
        class="fixed z-[9999] text-white rounded-full w-8 h-8 flex items-center justify-center border-2 border-slate-700 pointer-events-none"
        style="left: {mouseX + 20}px; top: {mouseY - 10}px; transform: translate(0, 0); background-color: {preferencesState.completedTaskColor};"
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
    
    :global(.task-card) {
        transition: background-color 0.2s ease !important;
    }
</style>