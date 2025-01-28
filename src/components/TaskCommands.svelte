<!-- src/components/TaskCommands.svelte -->
<script>
    import {
        Sidebar,
        SidebarGroup,
        SidebarItem,
        SidebarDropdownWrapper,
        SidebarButton,
        uiHelpers,
    } from "svelte-5-ui-lib";
    import {
        SearchOutline,
        RefreshOutline,
        BadgeCheckOutline,
        SortOutline,
        TrashBinOutline,
        FolderOutline,
    } from "flowbite-svelte-icons";
    import { goto } from "$app/navigation";
    import { taskState, loadTasks, allTasksCompleted } from "$lib/appTaskManager.svelte";
    import { getDisplayTasks } from "$lib/appTaskFilters.svelte";

    import { updateTaskStatus } from "$lib/kintoneUpdateRecords.svelte";
    import { deleteRecords } from "$lib/kintoneDeleteRecords.svelte.js";
    import ConfirmDeleteModal from "./ConfirmDeleteModal.svelte";
    import ConfirmCompleteModal from "./ConfirmCompleteModal.svelte";
    import NoticeModal from "./NoticeModal.svelte";

    const sidebarUI = uiHelpers();
    const deleteModalUI = uiHelpers();
    const completeModalUI = uiHelpers();
    let isOpen = $state(true);
    const closeSidebar = sidebarUI.close;

    $effect(() => {
        isOpen = sidebarUI.isOpen;
    });

    // filter actions
    import {
        viewState,
        setFilter,
        toggleSort,
    } from "$lib/appTaskFilters.svelte.js";
    const filterOverdue = () => setFilter("overdue");
    const filterCompleted = () => setFilter("completed");
    const filterRegistered = () => setFilter("registered");
    const filterUnregistered = () => setFilter("unregistered");

    // sort actions
    const sortByCreated = () => toggleSort("created");
    const sortByDue = () => toggleSort("due");
    let createdSortLabel = $derived(
        `Date Created ${
            viewState.sortField === "created"
                ? viewState.sortDirection === "asc"
                    ? "↑"
                    : "↓"
                : ""
        }`,
    );

    let dueSortLabel = $derived(
        `Due Date ${
            viewState.sortField === "due"
                ? viewState.sortDirection === "asc"
                    ? "↑"
                    : "↓"
                : ""
        }`,
    );

    // sync
    const sync = () => loadTasks();

    // select all
    let selectAllText = $derived(
        taskState.selectedTasks.length === taskState.tasks.length
            ? "Deselect All"
            : "Select All",
    );

    function toggleSelectAll() {
        if (taskState.selectedTasks.length === taskState.tasks.length) {
            taskState.selectedTasks = [];
        } else {
            taskState.selectedTasks = taskState.tasks.map((task) => task.id);
        }
    }

    const completeTask = () => {
        if (taskState.selectedTasks.length > 0) {
            completeModalUI.toggle();
        }
    };

    const handleComplete = async () => {
        if (!allTasksCompleted(taskState.selectedTasks, taskState.tasks)) {
            try {
                await updateTaskStatus("16");
            } catch (err) {
                console.error("failed to complete task", err);
            }
        }
    };

    const deleteTask = () => {
        if (taskState.selectedTasks.length > 0) {
            deleteModalUI.toggle();
        }
    };

    const handleDelete = async () => {
        try {
            await deleteRecords("16");
            if (window.location.pathname.includes("/task/")) {
                goto("/home");
            }
        } catch (err) {
            console.error("Failed to delete tasks:", err);
        }
    };
</script>

<div class="relative">
    <SidebarButton onclick={sidebarUI.toggle} class="mb-2" />
    <Sidebar
        isSingle={false}
        backdrop={false}
        {isOpen}
        {closeSidebar}
        class="bg-thistle z-10 h-full border-r-2 border-ebony"
        divClass="bg-transparent px-6 py-20 overflow-y-auto"
    >
        <SidebarGroup>
            <SidebarDropdownWrapper
                label="Filter"
                btnClass="cursor-pointer mb-3 flex items-center text-base font-normal text-gray-900 rounded-lg border border-ebony-200 p-3 hover:bg-thistle-800 bg-white"
            >
                {#snippet iconSlot()}
                    <SearchOutline
                        class="h-5 w-5 text-ebony-600 transition-colors hover:text-moss_green-600"
                    />
                {/snippet}
                <SidebarItem
                    label="Overdue Tasks"
                    onclick={filterOverdue}
                    class="cursor-pointer"
                    activeClass="flex items-center text-base font-normal text-gray-900 p-3 hover:bg-white rounded"
                    nonActiveClass="flex items-center text-base font-normal text-gray-900 p-3 hover:bg-white rounded"
                />
                <SidebarItem
                    label="Completed Tasks"
                    onclick={filterCompleted}
                    class="cursor-pointer"
                    activeClass="flex items-center text-base font-normal text-gray-900 p-3 hover:bg-white rounded"
                    nonActiveClass="flex items-center text-base font-normal text-gray-900 p-3 hover:bg-white rounded"
                />
                <SidebarItem
                    label="Registered Tasks"
                    onclick={filterRegistered}
                    class="cursor-pointer"
                    activeClass="flex items-center text-base font-normal text-gray-900 p-3 hover:bg-white rounded"
                    nonActiveClass="flex items-center text-base font-normal text-gray-900 p-3 hover:bg-white rounded"
                />
                <SidebarItem
                    label="Unregistered Tasks"
                    onclick={filterUnregistered}
                    class="cursor-pointer"
                    activeClass="flex items-center text-base font-normal text-gray-900 p-3 hover:bg-white rounded"
                    nonActiveClass="flex items-center text-base font-normal text-gray-900 p-3 hover:bg-white rounded"
                />
            </SidebarDropdownWrapper>

            <SidebarDropdownWrapper
                label="Sort"
                btnClass="cursor-pointer mb-3 flex items-center text-base font-normal text-gray-900 rounded-lg border border-ebony-200 p-3 hover:bg-thistle-800 bg-white"
            >
                {#snippet iconSlot()}
                    <SortOutline
                        class="h-5 w-5 text-ebony-600 transition-colors hover:text-moss_green-600"
                    />
                {/snippet}
                <SidebarItem
                    label={createdSortLabel}
                    onclick={sortByCreated}
                    class="cursor-pointer"
                    activeClass="flex items-center text-base font-normal text-gray-900 p-3 hover:bg-white rounded"
                    nonActiveClass="flex items-center text-base font-normal text-gray-900 p-3 hover:bg-white rounded"
                />

                <SidebarItem
                    label={dueSortLabel}
                    onclick={sortByDue}
                    class="cursor-pointer"
                    activeClass="flex items-center text-base font-normal text-gray-900 p-3 hover:bg-white rounded"
                    nonActiveClass="flex items-center text-base font-normal text-gray-900 p-3 hover:bg-white rounded"
                />
            </SidebarDropdownWrapper>

            <SidebarItem
                label="Sync"
                onclick={sync}
                class="cursor-pointer mb-3"
                activeClass="flex items-center text-base font-normal text-gray-900 rounded-lg border border-ebony-200 p-3 hover:bg-thistle-800 bg-white"
                nonActiveClass="flex items-center text-base font-normal text-gray-900 rounded-lg border border-ebony-200 p-3 hover:bg-thistle-800 bg-white"
            >
                {#snippet iconSlot()}
                    <RefreshOutline
                        class="h-5 w-5 text-ebony-600 transition-colors hover:text-moss_green-600"
                    />
                {/snippet}
            </SidebarItem>
        </SidebarGroup>
        <SidebarGroup border>
            <SidebarItem
                label={selectAllText}
                onclick={toggleSelectAll}
                class="cursor-pointer mb-3"
                activeClass="flex items-center text-base font-normal text-gray-900 rounded-lg border border-ebony-200 p-3 hover:bg-thistle-800 bg-white"
                nonActiveClass="flex items-center text-base font-normal text-gray-900 rounded-lg border border-ebony-200 p-3 hover:bg-thistle-800 bg-white"
            >
                {#snippet iconSlot()}
                    <BadgeCheckOutline
                        class="h-5 w-5 text-ebony-600 transition-colors hover:text-moss_green-600"
                    />
                {/snippet}
            </SidebarItem>
            <SidebarItem
                label="Mark Complete"
                onclick={taskState.selectedTasks.length > 0
                    ? completeTask
                    : undefined}
                class="cursor-pointer mb-3 {taskState.selectedTasks.length === 0
                    ? 'opacity-50'
                    : ''}"
                activeClass="flex items-center text-base font-normal text-gray-900 rounded-lg border border-ebony-200 p-3 bg-white {taskState
                    .selectedTasks.length > 0
                    ? 'hover:bg-moss_green-700'
                    : 'cursor-not-allowed'}"
                nonActiveClass="flex items-center text-base font-normal text-gray-900 rounded-lg border border-ebony-200 p-3 bg-white {taskState
                    .selectedTasks.length > 0
                    ? 'hover:bg-moss_green-700'
                    : 'cursor-not-allowed'}"
            >
                {#snippet iconSlot()}
                    <BadgeCheckOutline
                        class="h-5 w-5 text-ebony-600 transition-colors"
                    />
                {/snippet}
            </SidebarItem>
            <SidebarItem
                label="Delete Selected"
                onclick={taskState.selectedTasks.length > 0
                    ? deleteTask
                    : undefined}
                class="cursor-pointer mb-3 {taskState.selectedTasks.length === 0
                    ? 'opacity-50'
                    : ''}"
                activeClass="flex items-center text-base font-normal text-gray-900 rounded-lg border border-ebony-200 p-3 bg-white {taskState
                    .selectedTasks.length > 0
                    ? 'hover:bg-red-500'
                    : 'cursor-not-allowed'}"
                nonActiveClass="flex items-center text-base font-normal text-gray-900 rounded-lg border border-ebony-200 p-3 bg-white {taskState
                    .selectedTasks.length > 0
                    ? 'hover:bg-red-500'
                    : 'cursor-not-allowed'}"
            >
                {#snippet iconSlot()}
                    <TrashBinOutline
                        class="h-5 w-5 text-ebony-600 transition-colors"
                    />
                {/snippet}
            </SidebarItem>
        </SidebarGroup>
        <SidebarGroup border>
            <SidebarDropdownWrapper
                label="Folders"
                btnClass="cursor-pointer mb-3 flex items-center text-base font-normal text-gray-900 rounded-lg border border-ebony-200 p-3 hover:bg-thistle-800 bg-white"
            >
                {#snippet iconSlot()}
                    <FolderOutline
                        class="h-5 w-5 text-ebony-600 transition-colors hover:text-moss_green-600"
                    />
                {/snippet}
                <SidebarItem
                    label="Overdue Tasks"
                    onclick={filterOverdue}
                    class="cursor-pointer"
                    activeClass="flex items-center text-base font-normal text-gray-900 p-3 hover:bg-white rounded"
                    nonActiveClass="flex items-center text-base font-normal text-gray-900 p-3 hover:bg-white rounded"
                />
                <SidebarItem
                    label="Completed Tasks"
                    onclick={filterCompleted}
                    class="cursor-pointer"
                    activeClass="flex items-center text-base font-normal text-gray-900 p-3 hover:bg-white rounded"
                    nonActiveClass="flex items-center text-base font-normal text-gray-900 p-3 hover:bg-white rounded"
                />
            </SidebarDropdownWrapper>
        </SidebarGroup>
    </Sidebar>
</div>

<ConfirmDeleteModal modalUI={deleteModalUI} onConfirm={handleDelete} />

{#if allTasksCompleted(taskState.selectedTasks, taskState.tasks)}
    <NoticeModal
        modalUI={completeModalUI}
        message="All selected tasks are already completed."
    />
{:else}
    <ConfirmCompleteModal
        modalUI={completeModalUI}
        onConfirm={handleComplete}
    />
{/if}
