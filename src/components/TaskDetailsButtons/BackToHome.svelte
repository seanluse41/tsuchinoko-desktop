<!-- src/components/TaskDetailsButtons/BackToHome.svelte -->
<script>
    import { SidebarItem } from "svelte-5-ui-lib";
    import { ArrowLeftOutline } from "flowbite-svelte-icons";
    import { goto } from "$app/navigation";

    const goBack = () => goto("/home");
</script>

<SidebarItem
    label="Back to Tasks"
    onclick={goBack}
    class="cursor-pointer mb-3"
    activeClass="flex items-center text-base font-normal text-gray-900 rounded-lg border border-ebony-200 p-3 hover:bg-thistle-800 bg-white"
    nonActiveClass="flex items-center text-base font-normal text-gray-900 rounded-lg border border-ebony-200 p-3 hover:bg-thistle-800 bg-white"
>
    {#snippet iconSlot()}
        <ArrowLeftOutline class="h-5 w-5 text-ebony-600 transition-colors hover:text-moss_green-600" />
    {/snippet}
</SidebarItem>