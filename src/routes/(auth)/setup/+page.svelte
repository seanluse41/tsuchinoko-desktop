<!-- src/routes/(auth)/setup/+page.svelte -->

<script>
    import { Input, Button, Card, P, Heading, List, Li } from "svelte-5-ui-lib";
    import {
        ArrowRightOutline,
        InfoCircleOutline,
        EyeOutline,
        EyeSlashOutline,
    } from "flowbite-svelte-icons";
    import { open } from "@tauri-apps/plugin-shell";
    import { onOpenUrl } from "@tauri-apps/plugin-deep-link";
    import { invoke } from "@tauri-apps/api/core";
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { secretManager } from "../../../requests/appSecretManager";

    let subdomain = $state("");
    let clientId = $state("");
    let clientSecret = $state("");
    let showSecret = $state(false);
    let error = $state(null);
    let isLoading = $state(false);
    let authToken = $state(null);

    let adminUrl = $derived(
        `https://${subdomain}.kintone.com/admin/integrations/oauth/list`,
    );

    async function openKintoneAdmin() {
        if (subdomain) {
            try {
                await open(adminUrl);
            } catch (err) {
                console.error("Failed to open browser:", err);
                error = "Failed to open Kintone admin page. Please try again.";
            }
        }
    }

    async function handleAuthCallback(url) {
        try {
            const parsedUrl = new URL(url);
            const code = parsedUrl.searchParams.get("code");
            const state = parsedUrl.searchParams.get("state");
            const authError = parsedUrl.searchParams.get("error");

            if (authError) {
                throw new Error(`Authentication error: ${authError}`);
            }

            const savedState = localStorage.getItem("kintone_state");
            if (!savedState || state !== savedState) {
                throw new Error("State mismatch - possible CSRF attack");
            }

            // Clear the state immediately to prevent reuse
            localStorage.removeItem("kintone_state");

            if (!code) {
                throw new Error("No authorization code received");
            }

            const config = {
                client_id: await secretManager.getSecret("kintone_client_id"),
                client_secret: await secretManager.getSecret(
                    "kintone_client_secret",
                ),
                subdomain: await secretManager.getSecret("kintone_subdomain"),
            };

            const tokenResponse = await invoke("kintone_exchange_token", {
                code,
                redirectUri: "https://seanbase.com/tsuuchinoko-auth",
                config,
            });

            if (!tokenResponse || !tokenResponse.access_token) {
                throw new Error("Invalid token response");
            }

            await secretManager.storeSecret(
                "kintone_access_token",
                tokenResponse.access_token,
            );
            if (tokenResponse.refresh_token) {
                await secretManager.storeSecret(
                    "kintone_refresh_token",
                    tokenResponse.refresh_token,
                );
            }

            // Remove the deep link listener
            window.removeEventListener("tauri://deep-link", handleAuthCallback);

            authToken = tokenResponse.access_token;
            await goto("/home");
        } catch (err) {
            console.error("Authentication error:", err);
            error = err.message || "Authentication failed. Please try again.";
            authToken = null;
        } finally {
            isLoading = false;
        }
    }

    async function handleSubmit() {
        try {
            if (!subdomain || !clientId || !clientSecret) {
                error = "Please fill in all fields";
                return;
            }

            isLoading = true;
            error = null;

            await Promise.all([
                secretManager.storeSecret("kintone_client_id", clientId),
                secretManager.storeSecret(
                    "kintone_client_secret",
                    clientSecret,
                ),
                secretManager.storeSecret("kintone_subdomain", subdomain),
            ]);

            const state = generateState();
            localStorage.setItem("kintone_state", state);

            const authUrl = new URL(
                `https://${subdomain}.kintone.com/oauth2/authorization`,
            );
            authUrl.searchParams.append("response_type", "code");
            authUrl.searchParams.append("client_id", clientId);
            authUrl.searchParams.append(
                "redirect_uri",
                "https://seanbase.com/tsuuchinoko-auth",
            );
            authUrl.searchParams.append("state", state);
            authUrl.searchParams.append(
                "scope",
                "k:app_settings:read k:app_settings:write",
            );

            await open(authUrl.toString());
        } catch (err) {
            error = err.message || "Setup failed. Please try again.";
        }
    }

    function generateState() {
        const array = new Uint8Array(32);
        window.crypto.getRandomValues(array);
        return Array.from(array, (byte) =>
            byte.toString(16).padStart(2, "0"),
        ).join("");
    }

    onMount(async () => {
        try {
            const unsubscribe = await onOpenUrl(handleAuthCallback);
            return () => unsubscribe();
        } catch (err) {
            error = "Failed to initialize app. Please restart.";
        }
    });

    function toggleSecretVisibility() {
        showSecret = !showSecret;
    }
</script>

<main class="flex min-h-screen w-full p-8 bg-amber-900">
    <Card class="max-w-4xl mx-auto w-full p-8 z-10">
        <Heading level={1} class="mb-6 text-center text-ebony-200">
            First Time Setup
        </Heading>

        {#if error}
            <div
                class="mb-4 p-4 bg-redwood-100 border border-redwood-300 rounded-md"
            >
                <P class="text-redwood-800">{error}</P>
            </div>
        {/if}

        {#if authToken}
            <div
                class="mb-4 p-4 bg-moss_green-100 border border-moss_green-300 rounded-md"
            >
                <P class="text-moss_green-800 font-bold"
                    >Authentication Successful!</P
                >
            </div>
        {/if}

        <List class="space-y-8 mb-8">
            <Li>
                <div class="flex flex-col gap-2">
                    <P class="font-bold">1. Enter your Kintone subdomain:</P>
                    <div class="flex items-center gap-2">
                        <P>https://</P>
                        <Input
                            bind:value={subdomain}
                            placeholder="your-subdomain"
                            class="w-48"
                        />
                        <P>.kintone.com</P>
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
                                onclick={toggleSecretVisibility}
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
                disabled={!subdomain || !clientId || !clientSecret || isLoading}
                class="w-1/2 bg-amber hover:bg-amber-700"
                size="xl"
            >
                {#if isLoading}
                    <span class="inline-flex items-center">
                        <svg
                            class="animate-spin h-5 w-5 mr-3"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                class="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                stroke-width="4"
                                fill="none"
                            />
                            <path
                                class="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                        </svg>
                        Processing...
                    </span>
                {:else}
                    Complete Setup
                {/if}
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
