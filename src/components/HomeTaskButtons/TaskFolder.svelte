<!-- /src/components/HomeTaskButtons/TaskFolder.svelte -->
<script>
    import { SidebarItem } from "svelte-5-ui-lib";
    import { FolderOutline } from "flowbite-svelte-icons";
    import { droppable } from "@thisux/sveltednd";
    import { dragState, setActiveFolderId, clearActiveFolderId } from "$lib/appTaskDragState.svelte.js";
    import { folderState, selectFolder } from "$lib/appFolderManager.svelte.js";
    import { resetFiltersAndSort } from "$lib/appTaskFilters.svelte.js";

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
            activeClass="flex items-center text-base font-normal text-gray-900 rounded-lg border border-ebony-200 p-3 hover:bg-thistle-700 {isSelected ? 'bg-thistle-400' : 'bg-white'}"
            nonActiveClass="flex items-center text-base font-normal text-gray-900 rounded-lg border border-ebony-200 p-3 hover:bg-thistle-700 {isSelected ? 'bg-thistle-400' : 'bg-white'}"
        >
            {#snippet iconSlot()}
                <FolderOutline
                    class="h-5 w-5 text-ebony-600 transition-colors hover:text-moss_green-600"
                />
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