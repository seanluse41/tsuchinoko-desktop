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
        Button,
        Spinner,
        Alert, // Added Alert component
    } from "svelte-5-ui-lib";
    import { platform } from "@tauri-apps/plugin-os";
    import { getVersion } from "@tauri-apps/api/app";
    import { trackNavigation } from "$lib/app/appNavigationTracker.svelte";
    import { preferencesState } from "$lib/app/appPreferences.svelte";
    import { _ } from "svelte-i18n";
    import UpdaterModal from "../../../components/UpdaterModal.svelte";
    import { checkForUpdates, updaterState } from "$lib/os/updater.svelte.js";

    let isChecking = $state(false);
    let appVersion = $state("Loading...");
    let updateError = $state(null); // Added state for error alerts
    let isMobileApp = $state(false); // State to track if we're running on mobile

    // Add state for controlling the modal visibility
    let showUpdateModal = $state(false);

    // Use effect to load the version asynchronously and detect platform
    $effect(async () => {
        try {
            appVersion = await getVersion();
            // Detect if we're on mobile
            const platformType = await platform();
            isMobileApp = platformType === "android" || platformType === "ios";
        } catch (error) {
            console.error("Error getting app version:", error);
            appVersion = "Unknown";
        }
    });

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

    async function handleCheckForUpdates() {
        try {
            isChecking = true;
            updateError = null;

            const updateAvailable = await checkForUpdates();

            if (updateAvailable) {
                showUpdateModal = true;
            } else {
                updateError = {
                    type: "success",
                    message: "You're running the latest version!",
                };
            }
        } catch (error) {
            console.error("Error checking for updates:", error);

            updateError = {
                type: "failure",
                message: "Unable to fetch version info. Please contact the developers.",
            };
        } finally {
            isChecking = false;
        }
    }

    // Function to dismiss the alert
    function dismissAlert() {
        updateError = null;
    }

    // Function to open GitHub releases page (for mobile)
    function openGitHubReleases() {
        window.open(
            "https://github.com/seanluse41/tsuchinoko-desktop/releases",
            "_blank",
        );
    }

    // Function to close the update modal
    function closeUpdateModal() {
        showUpdateModal = false;
    }
</script>

<div class="relative w-full h-full overflow-auto p-4 md:py-16 md:px-32">
    <UpdaterModal modalStatus={showUpdateModal} closeModal={closeUpdateModal} />

    <Card
        class="max-w-none mx-auto mb-8 relative p-0 md:p-8"
        style="background-color: {preferencesState.menuColor || '#D1C1E9'}"
    >
        <div class="space-y-8">
            <div
                class="text-center mb-8 p-6 bg-white rounded-lg border border-slate-200"
            >
                <Heading
                    level={1}
                    class="text-3xl md:text-5xl font-bold mb-2 text-slate-800"
                    >{$_("about.aboutTsuuchinoko")}</Heading
                >
                <div class="text-lg text-slate-600 mb-4">
                    Version {appVersion}
                </div>

                <!-- Alert for update messages -->
                {#if updateError}
                    <Alert
                        color={updateError.type === "failure" ? "red" : "green"}
                        class="mb-4"
                        dismissable={true}
                        ondismiss={dismissAlert}
                    >
                        {updateError.message}
                    </Alert>
                {/if}

                <div class="flex flex-col md:flex-row justify-center gap-3">
                    <!-- Desktop update button (when not on mobile) -->
                    {#if !isMobileApp}
                        <Button
                            onclick={handleCheckForUpdates}
                            disabled={isChecking}
                            class="bg-thistle hover:bg-thistle-600 text-slate-700"
                        >
                            {#if isChecking}
                                <Spinner
                                    class="me-3"
                                    size="4"
                                    color="teal"
                                />Checking...
                            {:else}
                                Check for Updates
                            {/if}
                        </Button>
                    {/if}

                    <!-- Mobile release link button (always visible, but primary on mobile) -->
                    <Button
                        onclick={openGitHubReleases}
                        class="{isMobileApp
                            ? 'bg-thistle hover:bg-thistle-600'
                            : 'bg-slate-200 hover:bg-slate-300'} text-slate-700"
                    >
                        View Latest Releases
                    </Button>
                </div>
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
                        <strong>*{$_("about.securityNote")}</strong>
                        {$_("about.securityDescription")}
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
                        <Li class="text-slate-600">{$_("about.futurePlan1")}</Li
                        >
                        <Li class="text-slate-600">{$_("about.futurePlan2")}</Li
                        >
                        <Li class="text-slate-600">{$_("about.futurePlan3")}</Li
                        >
                    </List>
                </div>
            </Card>

            <Hr hrClass="my-8" />

            <Card class="max-w-none p-2 border border-slate-200">
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

            <Card class="max-w-none p-2 md:p-6 border border-slate-200">
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
                            <div class="p-3 break-words">
                                <A
                                    href={lib.url}
                                    target="_blank"
                                    class="text-slate-700 hover:text-slate-800 break-all"
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
