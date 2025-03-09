// src/lib/app/appSearchState.svelte.js

export const searchState = $state({
    isSearching: false,
    searchResults: [],
    noResults: false
});