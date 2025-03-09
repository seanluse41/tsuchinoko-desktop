<!-- /src/components/SearchBar.svelte -->

<script>
    import { Input } from "svelte-5-ui-lib";
    import { SearchOutline } from "flowbite-svelte-icons";
    import { preferencesState } from "$lib/app/appPreferences.svelte";
    import { _ } from "svelte-i18n";

    let searchInput = $state('');

    function handleSearchChange(event) {
        searchInput = event.target.value;
        console.log("Search input:", searchInput);
    }
</script>

<div class="flex-1 max-w-md mx-4 hidden md:block">
    <Input
        id="search"
        placeholder={$_("Search tasks...")}
        size="md"
        class="pl-10 w-full"
        value={searchInput}
        oninput={handleSearchChange}
    >
        {#snippet left()}
            <SearchOutline class="h-5 w-5 text-ebony-600" />
        {/snippet}
    </Input>
</div>
