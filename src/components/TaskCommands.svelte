<script>
    import {
        Sidebar,
        SidebarGroup,
        SidebarItem,
        SidebarButton,
        uiHelpers,
    } from "svelte-5-ui-lib";
    import {
        SearchOutline,
        RefreshOutline,
        BadgeCheckOutline,
    } from "flowbite-svelte-icons";
    import { authState } from "$lib/appLoginManager.svelte";
    import { getRecords } from "$lib/kintoneGetRecords.svelte";

    const sidebarUI = uiHelpers();
    let isOpen = $state(true);
    const closeSidebar = sidebarUI.close;

    $effect(() => {
        isOpen = sidebarUI.isOpen;
    });

    const filter = () => console.log("filtering");
    const sync = async () => {
        console.log("syncing");
        let records = await getRecords("16", "")
        console.log(records)

    };
    const selectAll = () => console.log("Select All");
</script>

<div class="relative">
    <SidebarButton onclick={sidebarUI.toggle} class="mb-2" />
    <Sidebar
        isSingle={false}
        backdrop={false}
        {isOpen}
        {closeSidebar}
        class="bg-thistle z-10 h-full border-r-2 border-ebony"
        divClass="bg-transparent px-6 py-20 overflow-y-auto"
    >
        <SidebarGroup>
            <SidebarItem
                label="Filter"
                onclick={filter}
                class="cursor-pointer mb-3 bg-white"
                activeClass="flex items-center text-base font-normal text-gray-900 rounded-lg border border-ebony-200 p-3 hover:bg-thistle-800"
                nonActiveClass="flex items-center text-base font-normal text-gray-900 rounded-lg border border-ebony-200 p-3 hover:bg-thistle-800"
            >
                {#snippet iconSlot()}
                    <SearchOutline
                        class="h-5 w-5 text-ebony-600 transition-colors hover:text-moss_green-600"
                    />
                {/snippet}
            </SidebarItem>

            <SidebarItem
                label="Sync"
                onclick={sync}
                class="cursor-pointer mb-3 bg-white"
                activeClass="flex items-center text-base font-normal text-gray-900 rounded-lg border border-ebony-200 p-3 hover:bg-thistle-800"
                nonActiveClass="flex items-center text-base font-normal text-gray-900 rounded-lg border border-ebony-200 p-3 hover:bg-thistle-800"
            >
                {#snippet iconSlot()}
                    <RefreshOutline
                        class="h-5 w-5 text-ebony-600 transition-colors hover:text-moss_green-600"
                    />
                {/snippet}
            </SidebarItem>

            <SidebarItem
                label="Select All"
                onclick={selectAll}
                class="cursor-pointer mb-3 bg-white"
                activeClass="flex items-center text-base font-normal text-gray-900 rounded-lg border border-ebony-200 p-3 hover:bg-thistle-800"
                nonActiveClass="flex items-center text-base font-normal text-gray-900 rounded-lg border border-ebony-200 p-3 hover:bg-thistle-800"
            >
                {#snippet iconSlot()}
                    <BadgeCheckOutline
                        class="h-5 w-5 text-ebony-600 transition-colors hover:text-moss_green-600"
                    />
                {/snippet}
            </SidebarItem>
        </SidebarGroup>
    </Sidebar>
</div>
