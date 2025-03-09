<!-- src/components/HomeTaskButtons/SyncTasks.svelte -->
<script>
    import { SidebarItem } from "svelte-5-ui-lib";
    import { RefreshOutline } from "flowbite-svelte-icons";
    import { Spinner } from "svelte-5-ui-lib";
    import { timerState, performSync } from "$lib/app/appTimerService.svelte.js";
    import { taskState } from "$lib/app/appTaskManager.svelte.js";
    import { _ } from "svelte-i18n";
    
    // Get button label based on loading state
    let buttonLabel = $derived(
        taskState.isLoading 
            ? $_('homeTaskButtons.syncing')
            : `${$_('homeTaskButtons.sync')} (${timerState.timeDisplay})`
    );
</script>

<SidebarItem
    label={buttonLabel}
    onclick={!taskState.isLoading ? performSync : undefined}
    class="cursor-pointer mb-3 {taskState.isLoading ? 'opacity-80' : ''}"
    activeClass="flex items-center text-base font-normal text-slate-700 font-bold rounded-lg border border-slate-700 p-3 hover:bg-slate-200 bg-white"
    nonActiveClass="flex items-center text-base font-normal text-slate-700 font-bold rounded-lg border border-slate-700 p-3 hover:bg-slate-200 bg-white"
>
    {#snippet iconSlot()}
        {#if taskState.isLoading}
            <Spinner size="5" color="thistle" class="mr-2" />
        {:else}
            <RefreshOutline
                class="h-5 w-5 text-ebony-600 transition-colors hover:text-moss_green-600"
            />
        {/if}
    {/snippet}
</SidebarItem>