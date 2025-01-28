<!-- src/components/TaskDetailsButtons/CopyToClipboard.svelte -->
<script>
    import { SidebarItem } from "svelte-5-ui-lib";
    import { FileCopyOutline } from "flowbite-svelte-icons";

    const copyToClipboard = () => console.log("copy to clipboard");
</script>

<SidebarItem
    label="Copy to Clipboard"
    onclick={copyToClipboard}
    class="cursor-pointer mb-3"
    activeClass="flex items-center text-base font-normal text-gray-900 rounded-lg border border-ebony-200 p-3 hover:bg-thistle-800 bg-white"
    nonActiveClass="flex items-center text-base font-normal text-gray-900 rounded-lg border border-ebony-200 p-3 hover:bg-thistle-800 bg-white"
>
    {#snippet iconSlot()}
        <FileCopyOutline class="h-5 w-5 text-ebony-600 transition-colors hover:text-moss_green-600" />
    {/snippet}
</SidebarItem>