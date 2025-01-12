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
    import { page } from "$app/stores";

    let activeUrl = $state($page.url.pathname);
    const sidebarUI = uiHelpers();
    let isOpen = $state(true);
    const closeSidebar = sidebarUI.close;

    $effect(() => {
        isOpen = true;
        activeUrl = $page.url.pathname;
    });

    const filter = () => console.log("filtering");
    const sync = () => console.log("syncing");
    const selectAll = () => console.log("Select All");
</script>

<div class="relative h-full">
    <Sidebar
        {activeUrl}
        isSingle={false}
        backdrop={false}
        isOpen={true}
        {closeSidebar}
        position="absolute"
        activeClass="p-2"
        class="z-50 h-full bg-thistle min-h-screen"
    >
        <SidebarGroup>
            <SidebarItem label="Filter" onclick={filter}>
                {#snippet iconSlot()}
                    <SearchOutline
                        class="h-5 w-5 text-ebony-600 transition duration-75 group-hover:text-moss_green-600"
                    />
                {/snippet}
            </SidebarItem>

            <SidebarItem label="Sync" onclick={sync}>
                {#snippet iconSlot()}
                    <RefreshOutline
                        class="h-5 w-5 text-ebony-600 transition duration-75 group-hover:text-moss_green-600"
                    />
                {/snippet}
            </SidebarItem>

            <SidebarItem label="Select All" onclick={selectAll}>
                {#snippet iconSlot()}
                    <BadgeCheckOutline
                        class="h-5 w-5 text-ebony-600 transition duration-75 group-hover:text-moss_green-600"
                    />
                {/snippet}
            </SidebarItem>
        </SidebarGroup>
    </Sidebar>
</div>
