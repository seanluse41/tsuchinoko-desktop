<!-- src/routes/(app)/about/+page.svelte -->
<script>
    import {
        Layout,
        P,
        Heading,
        Card,
        A,
        Hr,
        Accordion,
        AccordionItem,
        List,
        Li,
    } from "svelte-5-ui-lib";
    import { trackNavigation } from "$lib/app/appNavigationTracker.svelte";
    import { preferencesState } from "$lib/app/appPreferences.svelte";
    import { _ } from "svelte-i18n";

    // List of libraries used in the project
    const libraries = [
        {
            name: "Tauri",
            url: "https://tauri.app/",
        },
        {
            name: "Svelte 5",
            url: "https://svelte.dev/",
        },
        {
            name: "SvelteKit",
            url: "https://kit.svelte.dev/",
        },
        {
            name: "Tailwind CSS",
            url: "https://tailwindcss.com/",
        },
        {
            name: "svelte-5-ui-lib",
            url: "https://www.npmjs.com/package/svelte-5-ui-lib",
        },
        {
            name: "Flowbite Svelte Icons",
            url: "https://www.npmjs.com/package/flowbite-svelte-icons",
        },
        {
            name: "SvelteDnD",
            url: "https://www.npmjs.com/package/@thisux/sveltednd",
        },
        {
            name: "Tauri Stronghold",
            url: "https://www.npmjs.com/package/@tauri-apps/plugin-stronghold",
        },
        {
            name: "tsParticles",
            url: "https://www.npmjs.com/package/tsparticles-engine",
        },
        {
            name: "Air Datepicker",
            url: "https://www.npmjs.com/package/air-datepicker",
        },
    ];
</script>

<div class="relative w-full h-full overflow-auto z-10 py-16 px-32">
    <Card
        class="max-w-none mx-auto mb-8 relative p-8"
        style="background-color: {preferencesState.menuColor || '#D1C1E9'}"
    >
        <div class="space-y-8 p-4">
            <div
                class="text-center mb-8 p-6 bg-white rounded-lg border border-slate-200"
            >
                <Heading
                    level={1}
                    class="text-5xl font-bold mb-2 text-slate-800"
                    >{$_("about.aboutTsuuchinoko")}</Heading
                >
            </div>

            <Card class="max-w-none p-6 border border-slate-200">
                <Heading
                    level={2}
                    class="text-2xl font-bold mb-4 text-slate-700"
                    >{$_("about.whatIsTsuuchinoko")}</Heading
                >
                <P class="mb-6 text-slate-600">
                    {$_("about.appDescription")}
                </P>

                <Layout class="grid-cols-1 gap-6 sm:grid-cols-2">
                    <div
                        class="p-4 bg-white rounded-lg border border-slate-200"
                    >
                        <Heading
                            level={3}
                            class="text-xl font-semibold mb-3 text-slate-700"
                            >{$_("about.theProblem")}</Heading
                        >
                        <P class="mb-3 text-slate-600">
                            {$_("about.problemDescription")}
                        </P>
                    </div>
                    <div
                        class="p-4 bg-white rounded-lg border border-slate-200"
                    >
                        <Heading
                            level={3}
                            class="text-xl font-semibold mb-3 text-slate-700"
                            >{$_("about.theSolution")}</Heading
                        >
                        <P class="mb-3 text-slate-600">
                            {$_("about.solutionDescription")}
                        </P>
                    </div>
                </Layout>
            </Card>

            <Hr hrClass="my-8" />

            <Card class="max-w-none p-6 border border-slate-200">
                <Heading
                    level={2}
                    class="text-2xl font-bold mb-4 text-slate-700"
                    >{$_("about.technicalDetails")}</Heading
                >
                <P class="mb-3 text-slate-600">
                    {$_("about.technicalDescription")}
                </P>
                <div class="p-4 bg-white rounded-lg border border-red-200">
                    <P class="mb-0 text-red-800">
                        <strong>*{$_("about.securityNote")}</strong> {$_("about.securityDescription")}
                    </P>
                </div>
            </Card>

            <Hr hrClass="my-8" />

            <Card class="max-w-none p-6 border border-slate-200">
                <Heading
                    level={2}
                    class="text-2xl font-bold mb-4 text-slate-700"
                    >{$_("about.developmentStatus")}</Heading
                >
                <P class="mb-3 text-slate-600">
                    {$_("about.betaVersion")}
                </P>
                <div class="p-4 bg-white rounded-lg border border-slate-200">
                    <List class="space-y-2 mb-0">
                        <Li class="text-slate-600"
                            >{$_("about.futurePlan1")}</Li
                        >
                        <Li class="text-slate-600">{$_("about.futurePlan2")}</Li>
                        <Li class="text-slate-600"
                            >{$_("about.futurePlan3")}</Li
                        >
                    </List>
                </div>
            </Card>

            <Hr hrClass="my-8" />

            <Card class="max-w-none p-6 border border-slate-200">
                <Heading
                    level={2}
                    class="text-2xl font-bold mb-4 text-slate-700"
                    >{$_("about.resources")}</Heading
                >
                <Layout class="grid-cols-1 gap-6 sm:grid-cols-2 mb-0">
                    <Card
                        href="https://github.com/sean-kintone/tsuchinoko"
                        target="_blank"
                        class="p-4 border max-w-none border-slate-200 rounded-lg bg-white hover:bg-slate-100"
                    >
                        <Heading
                            level={3}
                            class="text-xl font-semibold mb-2 text-slate-700"
                            >{$_("about.chromeExtension")}</Heading
                        >
                        <P class="mb-3 text-slate-600">
                            {$_("about.extensionDescription")}
                        </P>
                        <A
                            href="https://github.com/sean-kintone/tsuchinoko"
                            target="_blank"
                            class="text-slate-700 hover:text-slate-800"
                        >
                            {$_("about.visitRepository")}
                        </A>
                    </Card>
                    <Card
                        href="https://kintone.dev/"
                        target="_blank"
                        class="p-4 border max-w-none border-slate-200 rounded-lg bg-white hover:bg-slate-100"
                    >
                        <Heading
                            level={3}
                            class="text-xl font-semibold mb-2 text-slate-700"
                            >{$_("about.kintoneDevProgram")}</Heading
                        >
                        <P class="mb-3 text-slate-600">
                            {$_("about.kintoneDevDescription")}
                        </P>
                        <A
                            href="https://kintone.dev/"
                            target="_blank"
                            class="text-slate-700 hover:text-slate-800"
                        >
                            {$_("about.visitKintoneDev")}
                        </A>
                    </Card>
                </Layout>
            </Card>

            <Hr hrClass="my-8" />

            <Card class="max-w-none p-6 border border-slate-200">
                <Heading
                    level={2}
                    class="text-2xl font-bold mb-4 text-slate-700"
                    >{$_("about.librariesDependencies")}</Heading
                >

                <Accordion
                    isSingle={false}
                    class="p-2"
                    flush={false}
                    activeClass="bg-white"
                    inactiveClass="bg-white"
                >
                    {#each libraries as lib}
                        <AccordionItem
                            class="bg-slate-100 rounded-lg mb-2 overflow-hidden"
                            activeClass="bg-white"
                            inactiveClass="bg-white"
                        >
                            {#snippet header()}
                                <span class="text-slate-700 font-medium p-3"
                                    >{lib.name}</span
                                >
                            {/snippet}
                            <div class="p-3">
                                <A
                                    href={lib.url}
                                    target="_blank"
                                    class="text-slate-700 hover:text-slate-800"
                                >
                                    {lib.url}
                                </A>
                            </div>
                        </AccordionItem>
                    {/each}
                </Accordion>
            </Card>
        </div>
    </Card>
</div>