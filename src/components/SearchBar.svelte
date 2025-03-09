<!-- /src/components/SearchBar.svelte -->

<script>
    import { Input } from "svelte-5-ui-lib";
    import { SearchOutline } from "flowbite-svelte-icons";
    import { preferencesState } from "$lib/app/appPreferences.svelte";
    import { taskState } from "$lib/app/appTaskManager.svelte";
    import { getDisplayTasks } from "$lib/app/appTaskFilters.svelte.js";
    import { resetFiltersAndSort } from "$lib/app/appTaskFilters.svelte.js";
    import { folderState, selectFolder } from "$lib/app/appFolderManager.svelte.js";
    import { searchState } from "$lib/app/appSearchState.svelte.js";
    import { page } from "$app/state";
    import { _ } from "svelte-i18n";

    let searchInput = $state('');
    
    // Check if we're on the home page
    let isHomePage = $derived(page.url.pathname === '/home');

    // Handle search function that runs on input changes
    function handleSearchChange(event) {
        searchInput = event.target.value;
        performSearch();
    }

    // Main search function that decides what to search and how
    function performSearch() {
        // Don't search if not on home page
        if (!isHomePage) {
            return;
        }
        
        const searchTerm = searchInput.trim();
        
        if (searchTerm === '') {
            // Empty search - reset everything
            searchState.isSearching = false;
            searchState.searchResults = [];
            searchState.noResults = false;
            return;
        }

        // Start search mode
        searchState.isSearching = true;
        
        // Choose search method based on user preference
        if (preferencesState.keepFilterOnSearch) {
            // Keep current filters and search within current view
            const displayTasks = getDisplayTasks();
            searchState.searchResults = filterTasksBySearchTerm(displayTasks, searchTerm);
        } else {
            // Global search - reset filters and folder
            resetFiltersAndSort();
            selectFolder('All');
            searchState.searchResults = filterTasksBySearchTerm(taskState.tasks, searchTerm);
        }
        
        // Update no results flag
        searchState.noResults = searchState.searchResults.length === 0;
    }

    // Filter tasks by search term
    function filterTasksBySearchTerm(tasks, term) {
        const lowerTerm = term.toLowerCase();
        
        return tasks.filter(task => {
            // Search through multiple fields
            const titleMatch = task.name?.toLowerCase().includes(lowerTerm);
            const descriptionMatch = task.description?.toLowerCase().includes(lowerTerm);
            const memoMatch = task.memo?.toLowerCase().includes(lowerTerm);
            const completionMemoMatch = task.completionMemo?.toLowerCase().includes(lowerTerm);
            
            // Handle creator which might be a string or an object
            let creatorMatch = false;
            if (task.creator) {
                if (typeof task.creator === 'string') {
                    creatorMatch = task.creator.toLowerCase().includes(lowerTerm);
                } else if (task.creator.name) {
                    creatorMatch = task.creator.name.toLowerCase().includes(lowerTerm);
                } else if (task.creator.code) {
                    creatorMatch = task.creator.code.toLowerCase().includes(lowerTerm);
                }
            }
            
            // Return true if any field matches
            return titleMatch || descriptionMatch || memoMatch || completionMemoMatch || creatorMatch;
        });
    }

    // Reset search - can be called externally
    export function resetSearch() {
        searchInput = '';
        searchState.isSearching = false;
        searchState.searchResults = [];
        searchState.noResults = false;
    }

    // Monitor page changes to reset search if leaving home
    $effect(() => {
        if (!isHomePage && searchState.isSearching) {
            resetSearch();
        }
    });
</script>

<div class="flex-1 max-w-md mx-4 hidden md:block">
    <Input
        id="search"
        placeholder={$_("Search tasks...")}
        size="md"
        class="pl-10 w-full"
        value={searchInput}
        oninput={handleSearchChange}
        disabled={!isHomePage}
    >
        {#snippet left()}
            <SearchOutline class="h-5 w-5 {isHomePage ? 'text-ebony-600' : 'text-ebony-300'}" />
        {/snippet}
    </Input>
</div>