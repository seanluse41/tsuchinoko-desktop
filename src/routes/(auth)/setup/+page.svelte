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
        spaceId,
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
            if (!subdomain || !clientId || !clientSecret || !spaceId) {
                authState.error = "Please fill in all fields";
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
            authState.error = err.message || "Setup failed. Please try again.";
            authState.isLoading = false;
        }
    }
</script>

<main class="flex w-full p-8 relative">
    <Card class="max-w-4xl mx-auto w-full p-4 md:p-8">
        <Heading level={1} class="mb-6 text-center text-slate-700">
            First Time Setup
        </Heading>

        {#if authState.error}
            <div
                class="mb-4 p-4 bg-slate-700 border border-redwood-300 rounded-md"
            >
                <P class="text-redwood-800">{authState.error}</P>
            </div>
        {/if}

        <div class="space-y-8 mb-8">
            <div class="flex flex-col gap-2">
                <P class="font-bold">1. Enter your Kintone subdomain:</P>
                <div class="flex-col md:flex space-y-4">
                    <div class="flex items-center gap-2">
                        <P>https://</P>
                        <Input
                            bind:value={subdomain}
                            placeholder="your-subdomain"
                            class="w-48"
                        />
                    </div>
                    <div class="flex gap-4">
                        <div class="rounded border border-slate-700 p-2">
                            <Radio
                                name="domain"
                                bind:group={domain}
                                value="cybozu.com"
                                labelClass="p-2"
                            >
                                .cybozu.com
                            </Radio>
                        </div>
                        <div class="rounded border border-slate-700 p-2">
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

            <div>
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
                        <ArrowRightOutline
                            class="ml-2 h-5 w-5 text-slate-700"
                        />
                    </Button>
                </div>
            </div>

            <div>
                <P class="font-bold text-slate-700"
                    >3. Click "Add OAuth Client" and enter:</P
                >
                <div class="ml-4 mt-2 space-y-2">
                    <P class="text-slate-700">• Client Name: Tsuuchinoko</P>
                    <P class="text-slate-700"
                        >• Redirect Endpoint:
                        https://seanbase.com/tsuuchinoko-auth</P
                    >
                </div>
            </div>

            <div>
                <div class="flex flex-col gap-2">
                    <P class="font-bold"
                        >4. After registering, copy your credentials:</P
                    >
                    <div class="space-y-4">
                        <Label for="client-id" class="mb-1">Client ID</Label>
                        <Input
                            id="client-id"
                            bind:value={clientId}
                            placeholder="Enter your Client ID"
                            class="w-full"
                        />
                        <div>
                            <Label for="client-secret" class="mb-1"
                                >Client Secret</Label
                            >
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
                                    placeholder="Enter your Client Secret"
                                    autocomplete="new-password"
                                />
                            </ButtonGroup>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Space ID Input -->
        <div class="flex flex-col gap-4 items-center mt-4 mb-4">
            <div class="w-full max-w-md">
                <Label for="space-id" class="mb-1"
                    >5. TSUUCHINOKO space ID:</Label
                >
                <Input
                    id="space-id"
                    type="text"
                    bind:value={spaceId}
                    placeholder="Enter space ID"
                    maxlength="3"
                    pattern="[0-9]{(1, 3)}"
                    required
                    class="w-full"
                />
                <span class="text-xs text-slate-500 mt-1">
                    Please enter the ID of your TSUUCHINOKO space (1-3 digits)
                </span>
                <span class="text-xs text-slate-500 mt-1">
                    Example: {`https://${subdomain}.${domain}/k/#/space/4/`}
                </span>
            </div>
        </div>

        <div class="flex flex-col gap-4 items-center">
            <Button
                onclick={handleSubmit}
                disabled={isButtonDisabled}
                class="bg-amber hover:bg-amber-700 text-slate-700"
                size="xl"
            >
                {#if authState.isLoading}
                    <Spinner class="mr-4" />
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
