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
    } from "flowbite-svelte-icons";
    import { taskState, loadTasks } from "$lib/appTaskManager.svelte";
    import { deleteRecords } from "$lib/kintoneDeleteRecords.svelte.js";

    const sidebarUI = uiHelpers();
    let isOpen = $state(true);
    const closeSidebar = sidebarUI.close;

    $effect(() => {
        isOpen = sidebarUI.isOpen;
    });

    // filter actions
    const filterOverdue = () => console.log("filtering overdue");
    const filterCompleted = () => console.log("filtering completed");
    const filterRegistered = () => console.log("filtering registered");
    const filterUnregistered = () => console.log("filtering unregistered");

    // sort actions
    const sortByCreated = () => console.log("sorting by date created");
    const sortByDue = () => console.log("sorting by due date");

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

    const deleteTask = async () => {
        try {
            await deleteRecords("16"); // Using app ID 16 as shown in other files
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
                    label="Date Created"
                    onclick={sortByCreated}
                    class="cursor-pointer"
                    activeClass="flex items-center text-base font-normal text-gray-900 p-3 hover:bg-white rounded"
                    nonActiveClass="flex items-center text-base font-normal text-gray-900 p-3 hover:bg-white rounded"
                />
                <SidebarItem
                    label="Due Date"
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
                    : ''}"
                nonActiveClass="flex items-center text-base font-normal text-gray-900 rounded-lg border border-ebony-200 p-3 bg-white {taskState
                    .selectedTasks.length > 0
                    ? 'hover:bg-red-500'
                    : ''}"
            >
                {#snippet iconSlot()}
                    <TrashBinOutline
                        class="h-5 w-5 text-ebony-600 transition-colors"
                    />
                {/snippet}
            </SidebarItem>
        </SidebarGroup>
    </Sidebar>
</div>
