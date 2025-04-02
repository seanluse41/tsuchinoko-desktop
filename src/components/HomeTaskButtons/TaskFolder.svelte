<!-- /src/components/HomeTaskButtons/TaskFolder.svelte -->
<script>
    import { SidebarItem } from "svelte-5-ui-lib";
    import { FolderOutline, FolderOpenOutline } from "flowbite-svelte-icons";
    import { droppable } from "@thisux/sveltednd";
    import {
        dragState,
        setActiveFolderId,
        clearActiveFolderId,
    } from "$lib/app/appTaskDragState.svelte.js";
    import { folderState, selectFolder } from "$lib/app/appFolderManager.svelte.js";
    import { resetFiltersAndSort } from "$lib/app/appTaskFilters.svelte.js";

    let { folderId, label, onDrop } = $props();

    let isSelected = $derived(folderState.selectedFolder === folderId);

    function handleClick() {
        selectFolder(folderId);
    }

    const handleDrop = (state) => {
        if (onDrop) onDrop(folderId, state);
    };

    const handleDragEnter = () => {
        setActiveFolderId(folderId);
    };

    let isActive = $derived(dragState.activeFolderId === folderId);
</script>

<div class="folder-item">
    <div
        class="relative p-1 -m-1 {isActive ? 'animated-outline' : ''}"
        use:droppable={{
            container: `folder-${folderId}`,
            callbacks: {
                onDrop: handleDrop,
                onDragEnter: handleDragEnter,
                onDragLeave: clearActiveFolderId,
            },
        }}
    >
        <SidebarItem
            {label}
            onclick={handleClick}
            class="cursor-pointer"
            activeClass="flex items-center text-base font-normal text-slate-700 font-bold rounded-lg border border-slate-700 p-3 hover:bg-slate-200 {isSelected
                ? 'bg-slate-200'
                : 'bg-white'}"
            nonActiveClass="flex items-center text-base font-normal text-slate-700 font-bold rounded-lg border border-slate-700 p-3 hover:bg-slate-200 {isSelected
                ? 'bg-slate-200'
                : 'bg-white'}"
        >
            {#snippet iconSlot()}
                {#if isSelected}
                    <FolderOpenOutline
                        class="h-5 w-5 flex-shrink-0 mr-2 text-slate-700 transition-colors hover:text-moss_green-600"
                    />
                {:else}
                    <FolderOutline
                        class="h-5 w-5 flex-shrink-0 mr-2 text-slate-700 transition-colors hover:text-moss_green-600"
                    />
                {/if}
            {/snippet}
        </SidebarItem>
    </div>
</div>

<style>
    .animated-outline {
        outline: 2px dashed #227558;
        outline-offset: 1px;
        animation: march 1s linear infinite;
    }

    /* Simple style to ensure text wraps if needed */
    :global(.folder-item a span) {
        word-break: break-word;
    }

    @keyframes march {
        0% {
            outline-offset: 10px;
            outline-style: dashed;
        }
        49% {
            outline-style: dashed;
        }
        50% {
            outline-style: dotted;
        }
        99% {
            outline-style: dotted;
        }
        100% {
            outline-offset: 10px;
            outline-style: dashed;
        }
    }
</style>