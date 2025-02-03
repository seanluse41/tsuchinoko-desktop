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
        activeClass="flex items-center text-base font-normal text-slate-700 font-bold rounded-lg border border-slate-700 border-dotted p-3 hover:bg-slate-200 bg-white"
        nonActiveClass="flex items-center text-base font-normal text-slate-700 font-bold rounded-lg border border-slate-700 border-dashed p-3 hover:bg-slate-200 bg-white"
    >
        {#snippet iconSlot()}
            <CirclePlusSolid class="h-5 w-5 text-slate-700" />
        {/snippet}
    </SidebarItem>
</div>