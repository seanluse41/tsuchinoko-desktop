<!-- src/components/FaqAccordion.svelte -->
<script>
    import { Accordion, AccordionItem, P } from "svelte-5-ui-lib";
    import { _ } from "svelte-i18n";
</script>

<Accordion
    class="w-full"
    activeClass="bg-thistle-500 text-slate-700"
    inactiveClass="text-slate-600"
>
    <AccordionItem>
        {#snippet header()}
            <span class="font-medium">{$_("faq.dataStorage.title")}</span>
        {/snippet}
        <div class="p-4 text-slate-600 space-y-2">
            <P>{$_("faq.dataStorage.content1")}</P>
            <P>{$_("faq.dataStorage.content2")}</P>
        </div>
    </AccordionItem>

    <AccordionItem>
        {#snippet header()}
            <span class="font-medium">{$_("faq.dataUsage.title")}</span>
        {/snippet}
        <div class="p-4 text-slate-600 space-y-2">
            <P>{$_("faq.dataUsage.content1")}</P>
            <P>{$_("faq.dataUsage.content2")}</P>
        </div>
    </AccordionItem>

    <AccordionItem>
        {#snippet header()}
            <span class="font-medium">{$_("faq.apiUsage.title")}</span>
        {/snippet}
        <div class="p-4 text-slate-600 space-y-2">
            <P>{$_("faq.apiUsage.content1")}</P>
            <P>{$_("faq.apiUsage.content2")}</P>
            <P>{$_("faq.apiUsage.content3")}</P>
            <div class="bg-slate-100 p-3 rounded my-2">
                {$_("faq.apiUsage.formula")}
            </div>
            <P>{$_("faq.apiUsage.example")}</P>
        </div>
    </AccordionItem>

    <AccordionItem>
        {#snippet header()}
            <span class="font-medium">{$_("faq.dataRemoval.title")}</span>
        {/snippet}
        <div class="p-4 text-slate-600 space-y-2">
            <P>{$_("faq.dataRemoval.content1")}</P>
            <P class="font-medium mt-2">{$_("faq.dataRemoval.locationsTitle")}</P>
            <ul class="list-disc pl-5 space-y-1">
                <li>{$_("faq.dataRemoval.windows")}</li>
                <li>{$_("faq.dataRemoval.mac")}</li>
                <li>{$_("faq.dataRemoval.linux")}</li>
                <li>{$_("faq.dataRemoval.android")}</li>
                <li>{$_("faq.dataRemoval.ios")}</li>
            </ul>
        </div>
    </AccordionItem>
</Accordion>