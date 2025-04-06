<!-- src/routes/(auth)/setup/+page.svelte -->
<script>
    import {
        Input,
        Button,
        Card,
        P,
        Heading,
        Radio,
        Spinner,
        ButtonGroup,
        InputAddon,
        Label,
    } from "svelte-5-ui-lib";
    import { goto } from "$app/navigation";
    import {
        ArrowRightOutline,
        InfoCircleOutline,
        EyeOutline,
        EyeSlashOutline,
        ArrowLeftOutline,
        LanguageOutline
    } from "flowbite-svelte-icons";
    import { _, locale } from "svelte-i18n";
    import { open } from "@tauri-apps/plugin-shell";
    import { buildAuthUrl } from "$lib/kintone/kintoneAuthRequest";
    import { authState } from "$lib/app/appLoginManager.svelte.js";
    import FaqAccordion from "../../../components/FaqAccordion.svelte";

    let currentLocale = $state("en");

    const changeLocale = () => {
        if (currentLocale == "en") {
            locale.set("ja");
            currentLocale = "ja";
        } else if (currentLocale == "ja") {
            locale.set("en");
            currentLocale = "en";
        }
    };

    let {
        subdomain,
        domain = "cybozu.com",
        clientId,
        clientSecret,
        spaceId,
    } = $state(authState.user);
    let showSecret = $state(false);

    let adminUrl = $derived(
        `https://${subdomain}.${domain}/admin/integrations/oauth/list`,
    );
    let isButtonDisabled = $derived(
        !subdomain ||
            !clientId ||
            !clientSecret ||
            !spaceId ||
            authState.isLoading,
    );
    let buttonText = $derived(
        authState.isLoading ? $_("setup.processing") : $_("setup.completeSetup")
    );

    async function openKintoneAdmin() {
        if (!subdomain) return;
        try {
            await open(adminUrl);
        } catch (err) {
            authState.error = $_("setup.failedAdminPage");
        }
    }

    async function handleSubmit() {
        try {
            if (!subdomain || !clientId || !clientSecret || !spaceId) {
                authState.error = $_("setup.fillAllFields");
                authState.isLoading = false;
                return;
            }

            Object.assign(authState, {
                isLoading: true,
                error: null,
                user: {
                    subdomain,
                    domain,
                    clientId,
                    clientSecret,
                    spaceId,
                },
            });

            await open(buildAuthUrl(subdomain, clientId, domain).toString());
        } catch (err) {
            authState.error = err.message || $_("setup.setupFailed");
            authState.isLoading = false;
        }
    }

    const backToLogin = () => {
        goto("/login");
    };
</script>

<main class="flex w-full p-4 md:p-8 relative">
    <Card class="max-w-none w-full">
        <div class="flex justify-between">
            <Button
                color="amber"
                onclick={backToLogin}
                class="border border-slate-300"
            >
                <ArrowLeftOutline class="h-5 w-5 text-slate-700" />
                <span class="ml-2 text-slate-700">{$_("setup.back")}</span>
            </Button>
            <Button
                color="indigo"
                onclick={changeLocale}
                class="border border-slate-300"
            >
                <LanguageOutline class="h-5 w-5 text-white" />
                <span class="ml-2 text-white">{currentLocale === "en" ? "日本語" : "English"}</span>
            </Button>
        </div>

        <Heading
            level={1}
            class="mt-12 md:mt-6 mb-8 text-center text-slate-700"
        >
            {$_("setup.title")}
        </Heading>

        {#if authState.error}
            <div class="mb-6 p-4 bg-red-50 border border-red-300 rounded-md">
                <P class="text-red-800">{authState.error}</P>
            </div>
        {/if}

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Left column: Setup form -->
            <div class="space-y-8">
                <div class="flex flex-col gap-2">
                    <P class="font-bold">{$_("setup.step1")}</P>
                    <div class="flex-col md:flex space-y-4">
                        <div class="flex items-center gap-2">
                            <P>https://</P>
                            <Input
                                bind:value={subdomain}
                                placeholder={$_("setup.subdomainPlaceholder")}
                                class="w-48"
                            />
                        </div>
                        <div class="flex gap-4">
                            <div class="rounded border border-slate-300 p-2">
                                <Radio
                                    name="domain"
                                    bind:group={domain}
                                    value="cybozu.com"
                                    labelClass="p-2"
                                >
                                    .cybozu.com
                                </Radio>
                            </div>
                            <div class="rounded border border-slate-300 p-2">
                                <Radio
                                    name="domain"
                                    bind:group={domain}
                                    value="kintone.com"
                                    labelClass="p-2"
                                >
                                    .kintone.com
                                </Radio>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="flex flex-col gap-2">
                    <P class="font-bold">{$_("setup.step2")}</P>
                    <Button
                        onclick={openKintoneAdmin}
                        disabled={!subdomain}
                        class="w-fit bg-thistle hover:bg-thistle-600"
                    >
                        <P>{$_("setup.openOAuthSettings")}</P>
                        <ArrowRightOutline
                            class="ml-2 h-5 w-5 text-slate-700"
                        />
                    </Button>
                </div>

                <div>
                    <P class="font-bold text-slate-700">{$_("setup.step3")}</P>
                    <div class="ml-4 mt-2 space-y-2">
                        <P class="text-slate-700">{$_("setup.clientName")}</P>
                        <P class="text-slate-700">{$_("setup.redirectEndpoint")}</P>
                    </div>
                </div>

                <div class="flex flex-col gap-2">
                    <P class="font-bold">{$_("setup.step4")}</P>
                    <div class="space-y-4">
                        <Label for="client-id" class="mb-1">{$_("setup.clientId")}</Label>
                        <Input
                            id="client-id"
                            bind:value={clientId}
                            placeholder={$_("setup.clientIdPlaceholder")}
                            class="w-full"
                        />
                        <div>
                            <Label for="client-secret" class="mb-1">{$_("setup.clientSecret")}</Label>
                            <ButtonGroup class="w-full">
                                <InputAddon>
                                    <button
                                        onclick={() =>
                                            (showSecret = !showSecret)}
                                    >
                                        {#if showSecret}
                                            <EyeOutline
                                                class="h-5 w-5 text-ebony-600"
                                            />
                                        {:else}
                                            <EyeSlashOutline
                                                class="h-5 w-5 text-ebony-600"
                                            />
                                        {/if}
                                    </button>
                                </InputAddon>
                                <Input
                                    id="client-secret"
                                    bind:value={clientSecret}
                                    type={showSecret ? "text" : "password"}
                                    placeholder={$_("setup.clientSecretPlaceholder")}
                                    autocomplete="new-password"
                                />
                            </ButtonGroup>
                        </div>
                    </div>
                </div>

                <!-- Space ID Input -->
                <div class="flex flex-col gap-2">
                    <Label for="space-id" class="font-bold">{$_("setup.step5")}</Label>
                    <Input
                        id="space-id"
                        type="text"
                        bind:value={spaceId}
                        placeholder={$_("setup.spaceIdPlaceholder")}
                        maxlength="3"
                        pattern="[0-9]{1,3}"
                        required
                        class="w-full"
                    />
                    <div class="text-xs text-slate-500 space-y-1 mt-1">
                        <p>{$_("setup.spaceIdHelp")}</p>
                        <p>
                            {$_("setup.spaceIdExample", { values: { 
                                subdomain: subdomain || $_("setup.yourSubdomain"), 
                                domain: domain 
                            }})}
                        </p>
                    </div>
                </div>

                <div class="flex flex-col items-center pt-4">
                    <Button
                        onclick={handleSubmit}
                        disabled={isButtonDisabled}
                        class="bg-amber hover:bg-amber-700 text-slate-700 w-full md:w-2/3"
                        size="xl"
                    >
                        {#if authState.isLoading}
                            <Spinner class="mr-4" />
                        {/if}
                        {buttonText}
                    </Button>

                    <div class="flex items-center gap-2 text-ebony-600 mt-4">
                        <InfoCircleOutline class="h-5 w-5" />
                        <a
                            href="https://kintone.dev/en/docs/common/authentication/how-to-add-oauth-clients/"
                            class="text-sm hover:text-moss_green-600"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {$_("setup.readMore")}
                        </a>
                    </div>
                </div>
            </div>

            <!-- Right column: FAQ accordion -->
            <div class="bg-white rounded-lg border border-slate-200 p-4 md:p-6">
                <h2 class="text-xl font-semibold mb-4 text-slate-700">
                    {$_("faq.title")}
                </h2>
                <FaqAccordion />
            </div>
        </div>
    </Card>
</main>

<!-- On mobile devices, put FAQ below the form -->
<style>
    @media (max-width: 768px) {
        :global(.grid-cols-1) {
            display: flex;
            flex-direction: column;
        }
    }
</style>