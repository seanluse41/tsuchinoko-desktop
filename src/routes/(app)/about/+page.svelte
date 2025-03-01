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
        Li
    } from "svelte-5-ui-lib";
    import { trackNavigation } from "$lib/app/appNavigationTracker.svelte";
    import { preferencesState } from "$lib/app/appPreferences.svelte";

    // List of libraries used in the project
    const libraries = [
        {
            name: "Tauri",
            url: "https://tauri.app/"
        },
        {
            name: "Svelte 5",
            url: "https://svelte.dev/"
        },
        {
            name: "SvelteKit",
            url: "https://kit.svelte.dev/"
        },
        {
            name: "Tailwind CSS",
            url: "https://tailwindcss.com/"
        },
        {
            name: "svelte-5-ui-lib",
            url: "https://www.npmjs.com/package/svelte-5-ui-lib"
        },
        {
            name: "Flowbite Svelte Icons",
            url: "https://www.npmjs.com/package/flowbite-svelte-icons"
        },
        {
            name: "SvelteDnD",
            url: "https://www.npmjs.com/package/@thisux/sveltednd"
        },
        {
            name: "Tauri Stronghold",
            url: "https://www.npmjs.com/package/@tauri-apps/plugin-stronghold"
        },
        {
            name: "tsParticles",
            url: "https://www.npmjs.com/package/tsparticles-engine"
        },
        {
            name: "Air Datepicker",
            url: "https://www.npmjs.com/package/air-datepicker"
        }
    ];
</script>

<!-- Set position relative for proper stacking context -->
<div class="relative w-full h-full overflow-auto z-10 py-16 px-32">
    <Card class="max-w-none mx-auto mb-8 relative p-8" style="background-color: {preferencesState.menuColor || '#D1C1E9'}">
        <div class="space-y-8 p-4">
            <div class="text-center mb-8 p-6 bg-white rounded-lg border border-slate-200">
                <Heading level={1} class="text-5xl font-bold mb-2 text-slate-800">About Tsuuchinoko</Heading>
            </div>

            <Card class="max-w-none p-6 border border-slate-200">
                <Heading level={2} class="text-2xl font-bold mb-4 text-slate-700">What is Tsuuchinoko?</Heading>
                <P class="mb-6 text-slate-600">
                    Tsuuchinoko is a specialized task management application designed to enhance productivity for Kintone users. It bridges the gap between Kintone notifications and actionable tasks, allowing users to efficiently manage their workflow across devices.
                </P>

                <Layout class="grid-cols-1 gap-6 sm:grid-cols-2">
                    <div class="p-4 bg-white rounded-lg border border-slate-200">
                        <Heading level={3} class="text-xl font-semibold mb-3 text-slate-700">The Problem</Heading>
                        <P class="mb-3 text-slate-600">
                            In Kintone, notifications often represent actionable items that require follow-up: checking documents, inputting data, or reviewing information. However, there's no built-in way to track these items as tasks.
                        </P>
                    </div>
                    <div class="p-4 bg-white rounded-lg border border-slate-200">
                        <Heading level={3} class="text-xl font-semibold mb-3 text-slate-700">The Solution</Heading>
                        <P class="mb-3 text-slate-600">
                            Tsuuchinoko combines a Chrome extension for converting notifications into tasks with a cross-platform desktop application for managing those tasks. This creates a seamless workflow for tracking and completing action items.
                        </P>
                    </div>
                </Layout>
            </Card>

            <Hr hrClass="my-8" />

            <Card class="max-w-none p-6 border border-slate-200">
                <Heading level={2} class="text-2xl font-bold mb-4 text-slate-700">Technical Details</Heading>
                <P class="mb-3 text-slate-600">
                    Tsuuchinoko uses OAuth authentication with Kintone. Tokens are hashed and stored locally on this machine. Tasks and notification content is not stored on the machine, only in Kintone.
                </P>
                <div class="p-4 bg-white rounded-lg border border-red-200">
                    <P class="mb-0 text-red-800">
                        <strong>*Security Note:</strong> While the application employs secure storage practices, environments with highly sensitive information should be aware that determined attackers could potentially decrypt OAuth tokens if they gain physical access to your device.
                    </P>
                </div>
            </Card>

            <Hr hrClass="my-8" />

            <Card class="max-w-none p-6 border border-slate-200">
                <Heading level={2} class="text-2xl font-bold mb-4 text-slate-700">Development Status</Heading>
                <P class="mb-3 text-slate-600">
                    This is currently a beta version for testing. Future plans for v1.0 include:
                </P>
                <div class="p-4 bg-white rounded-lg border border-slate-200">
                    <List class="space-y-2 mb-0">
                        <Li class="text-slate-600">Task assignment to other Tsuuchinoko users</Li>
                        <Li class="text-slate-600">More Language Support</Li>
                        <Li class="text-slate-600">More Customization Options</Li>
                    </List>
                </div>
            </Card>

            <Hr hrClass="my-8" />

            <Card class="max-w-none p-6 border border-slate-200">
                <Heading level={2} class="text-2xl font-bold mb-4 text-slate-700">Resources</Heading>
                <Layout class="grid-cols-1 gap-6 sm:grid-cols-2 mb-0">
                    <div class="p-4 border border-slate-200 rounded-lg bg-white hover:bg-slate-100">
                        <Heading level={3} class="text-xl font-semibold mb-2 text-slate-700">Chrome Extension</Heading>
                        <P class="mb-3 text-slate-600">
                            Install the companion Chrome extension to convert Kintone notifications into tasks.
                        </P>
                        <A href="https://github.com/sean-kintone/tsuchinoko" target="_blank" class="text-slate-700 hover:text-slate-800">
                            Visit Repository
                        </A>
                    </div>
                    <div class="p-4 border border-slate-200 rounded-lg bg-white hover:bg-slate-100">
                        <Heading level={3} class="text-xl font-semibold mb-2 text-slate-700">Kintone Developer Program</Heading>
                        <P class="mb-3 text-slate-600">
                            Learn more about building custom solutions on the Kintone platform.
                        </P>
                        <A href="https://kintone.dev/" target="_blank" class="text-slate-700 hover:text-slate-800">
                            Visit Kintone Developer Program
                        </A>
                    </div>
                </Layout>
            </Card>

            <Hr hrClass="my-8" />

            <Card class="max-w-none p-6 border border-slate-200">
                <Heading level={2} class="text-2xl font-bold mb-4 text-slate-700">Libraries & Dependencies</Heading>
                
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
                                <span class="text-slate-700 font-medium p-3">{lib.name}</span>
                            {/snippet}
                            <div class="p-3">
                                <A href={lib.url} target="_blank" class="text-slate-700 hover:text-slate-800">
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