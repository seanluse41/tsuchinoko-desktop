<script>
    import TaskItem from "./TaskItem.svelte";
    import Task404Alert from "./Task404Alert.svelte";
    import { taskState } from "$lib/app/appTaskManager.svelte";
    import { getDisplayTasks } from "$lib/app/appTaskFilters.svelte.js";
    import { searchState } from "$lib/app/appSearchState.svelte.js";
    import { _ } from "svelte-i18n";

    let alertStatus = $derived(!!taskState.error);
    
    // Use search results if searching, otherwise use normal filtered tasks
    let displayTasks = $derived(
        searchState.isSearching 
            ? searchState.searchResults 
            : getDisplayTasks()
    );
</script>

<div class="flex flex-col flex-grow w-full p-8 gap-4">
    <Task404Alert {alertStatus} />
    
    {#if searchState.noResults}
        <div class="p-4 bg-amber-100 text-amber-800 rounded-lg relative z-20">
            {$_("No tasks match your search")}
        </div>
    {/if}
    
    {#each displayTasks as task}
        <TaskItem {...task} />
    {/each}
</div>