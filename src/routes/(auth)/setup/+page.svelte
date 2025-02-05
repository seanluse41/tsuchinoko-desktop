<!-- src/routes/(auth)/setup/+page.svelte -->
<script>
    import {
        Input,
        Button,
        Card,
        P,
        Heading,
        List,
        Li,
        Spinner,
        Radio,
    } from "svelte-5-ui-lib";
    import {
        ArrowRightOutline,
        InfoCircleOutline,
        EyeOutline,
        EyeSlashOutline,
    } from "flowbite-svelte-icons";
    import { open } from "@tauri-apps/plugin-shell";
    import { buildAuthUrl } from "$lib/kintone/kintoneAuthRequest";
    import { authState } from "$lib/app/appLoginManager.svelte.js";

    let {
        subdomain,
        domain = "cybozu.com",
        clientId,
        clientSecret,
    } = $state(authState.user);
    let showSecret = $state(false);

    let adminUrl = $derived(
        `https://${subdomain}.${domain}/admin/integrations/oauth/list`,
    );
    let isButtonDisabled = $derived(
        !subdomain || !clientId || !clientSecret || authState.isLoading,
    );
    let buttonText = $derived(
        authState.isLoading ? "Processing..." : "Complete Setup",
    );

    async function openKintoneAdmin() {
        if (!subdomain) return;
        try {
            await open(adminUrl);
        } catch (err) {
            authState.error =
                "Failed to open Kintone admin page. Please try again.";
        }
    }

    async function handleSubmit() {
        try {
            if (!subdomain || !clientId || !clientSecret) {
                authState.error = "Please fill in all fields";
                authState.isLoading = false;
                return;
            }

            Object.assign(authState, {
                isLoading: true,
                error: null,
                user: { subdomain, domain, clientId, clientSecret },
            });

            await open(buildAuthUrl(subdomain, clientId, domain).toString());
        } catch (err) {
            authState.error = err.message || "Setup failed. Please try again.";
            authState.isLoading = false;
        }
    }
</script>

<main class="flex min-h-screen w-full p-8 bg-amber-900">
    <Card class="max-w-4xl mx-auto w-full p-8 z-10">
        <Heading level={1} class="mb-6 text-center text-ebony-200">
            First Time Setup
        </Heading>

        {#if authState.error}
            <div
                class="mb-4 p-4 bg-redwood-100 border border-redwood-300 rounded-md"
            >
                <P class="text-redwood-800">{authState.error}</P>
            </div>
        {/if}

        <List class="space-y-8 mb-8">
            <Li>
                <div class="flex flex-col gap-2">
                    <P class="font-bold">1. Enter your Kintone subdomain:</P>
                    <div class="flex gap-8">
                        <div class="flex items-center gap-2">
                            <P>https://</P>
                            <Input
                                bind:value={subdomain}
                                placeholder="your-subdomain"
                                class="w-48"
                            />
                        </div>
                        <div class="flex gap-4">
                            <div class="rounded border border-ebony-200 p-2">
                                <Radio
                                    name="domain"
                                    bind:group={domain}
                                    value="cybozu.com"
                                    labelClass="p-2"
                                >
                                    .cybozu.com
                                </Radio>
                            </div>
                            <div class="rounded border border-ebony-200 p-2">
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
            </Li>

            <Li>
                <div class="flex flex-col gap-2">
                    <P class="font-bold"
                        >2. Visit your Kintone OAuth settings:</P
                    >
                    <Button
                        onclick={openKintoneAdmin}
                        disabled={!subdomain}
                        class="w-fit bg-thistle hover:bg-thistle-600"
                    >
                        <P>Open OAuth Settings</P>
                        <ArrowRightOutline class="ml-2 h-5 w-5 text-ebony" />
                    </Button>
                </div>
            </Li>

            <Li>
                <P class="font-bold">3. Click "Add OAuth Client" and enter:</P>
                <div class="ml-4 mt-2 space-y-2">
                    <P>• Client Name: Tsuuchinoko</P>
                    <P
                        >• Redirect Endpoint:
                        https://seanbase.com/tsuuchinoko-auth</P
                    >
                </div>
            </Li>

            <Li>
                <div class="flex flex-col gap-2">
                    <P class="font-bold"
                        >4. After registering, copy your credentials:</P
                    >
                    <div class="space-y-4">
                        <Input
                            bind:value={clientId}
                            placeholder="Enter your Client ID"
                            class="w-full"
                        />
                        <div class="relative">
                            <Input
                                bind:value={clientSecret}
                                type={showSecret ? "text" : "password"}
                                placeholder="Enter your Client Secret"
                                class="w-full pr-10"
                            />
                            <button
                                type="button"
                                onclick={() => (showSecret = !showSecret)}
                                class="absolute right-2 top-1/2 -translate-y-1/2"
                            >
                                {#if showSecret}
                                    <EyeSlashOutline
                                        class="h-5 w-5 text-ebony-600"
                                    />
                                {:else}
                                    <EyeOutline
                                        class="h-5 w-5 text-ebony-600"
                                    />
                                {/if}
                            </button>
                        </div>
                    </div>
                </div>
            </Li>
        </List>

        <div class="flex flex-col gap-4 items-center">
            <Button
                onclick={handleSubmit}
                disabled={isButtonDisabled}
                class="w-1/2 bg-amber hover:bg-amber-700"
                size="xl"
            >
                {#if authState.isLoading}
                    <Spinner />
                {/if}
                {buttonText}
            </Button>

            <div class="flex items-center gap-2 text-ebony-600">
                <InfoCircleOutline class="h-5 w-5" />
                <a
                    href="https://kintone.dev/en/docs/common/authentication/how-to-add-oauth-clients/"
                    class="text-sm hover:text-moss_green-600"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Read more about Kintone OAuth setup
                </a>
            </div>
        </div>
    </Card>
</main>
