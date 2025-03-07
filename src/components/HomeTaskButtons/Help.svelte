<!-- src/components/HomeTaskButtons/Help.svelte -->
<script>
    import { SidebarItem, uiHelpers } from "svelte-5-ui-lib";
    import { QuestionCircleOutline } from "flowbite-svelte-icons";
    import HelpModal from "../HelpModal.svelte";
    import { _ } from "svelte-i18n";

    const modalUI = uiHelpers();

    function openHelpModal() {
        modalUI.toggle();
    }
</script>

<SidebarItem
    label={$_('homeTaskButtons.helpTips')}
    onclick={openHelpModal}
    class="cursor-pointer mb-3"
    activeClass="flex items-center text-base font-normal text-slate-700 font-bold rounded-lg border border-slate-700 p-3 hover:bg-slate-200 bg-white"
    nonActiveClass="flex items-center text-base font-normal text-slate-700 font-bold rounded-lg border border-slate-700 p-3 hover:bg-slate-200 bg-white"
>
    {#snippet iconSlot()}
        <QuestionCircleOutline
            class="h-5 w-5 text-ebony-600 transition-colors hover:text-moss_green-600"
        />
    {/snippet}
</SidebarItem>

<HelpModal modalUI={modalUI} />