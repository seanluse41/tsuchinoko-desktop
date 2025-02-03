<!-- src/components/AddFolder.svelte -->
<script>
    import { SidebarItem } from "svelte-5-ui-lib";
    import { CirclePlusSolid } from "flowbite-svelte-icons";
    
    let { onclick } = $props();

    function handleClick() {
        console.log("Add folder clicked");
        if (onclick) onclick();
    }
</script>

<div class="folder-item">
    <SidebarItem
        label="Add Folder"
        {onclick}
        class="cursor-pointer"
        activeClass="flex items-center text-base font-normal text-gray-900 rounded-lg border border-ebony-200 border-dotted p-3 hover:bg-transparent bg-transparent"
        nonActiveClass="flex items-center text-base font-normal text-gray-900 rounded-lg border border-ebony-200 border-dotted p-3 hover:bg-transparent bg-transparent"
    >
        {#snippet iconSlot()}
            <CirclePlusSolid class="h-5 w-5 text-ebony-600 transition-colors hover:text-moss_green-600" />
        {/snippet}
    </SidebarItem>
</div>