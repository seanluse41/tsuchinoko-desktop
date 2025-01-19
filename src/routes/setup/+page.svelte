<script>
    import { Input, Button, Card, P, Heading, List, Li } from "svelte-5-ui-lib";
    import {
        ArrowRightOutline,
        InfoCircleOutline,
    } from "flowbite-svelte-icons";
    import { open } from "@tauri-apps/plugin-shell";

    let subdomain = $state("");
    let clientId = $state("");
    let adminUrl = $derived(
        `https://${subdomain}.kintone.com/admin/integrations/oauth/list`,
    );

    async function openKintoneAdmin() {
        if (subdomain) {
            try {
                await open(adminUrl);
            } catch (err) {
                console.error("Failed to open browser:", err);
            }
        }
    }

    async function handleSubmit() {
        try {
            error = null;
            localStorage.setItem("kintone_subdomain", subdomain);
            localStorage.setItem("kintone_client_id", clientId);

            const authUrl = buildAuthUrl(subdomain, clientId);
            await open(authUrl.toString());
        } catch (err) {
            console.error("Setup failed:", err);
            error = "Setup failed. Please try again.";
        }
    }
</script>

<main class="flex min-h-screen w-full p-8 bg-amber-900">
    <Card class="max-w-4xl mx-auto w-full p-8 z-10">
        <Heading level={1} class="mb-6 text-center text-ebony-200">
            First Time Setup
        </Heading>

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
                        <P>Open OAuth Settings</P><ArrowRightOutline
                            class="ml-2 h-5 w-5 text-ebony"
                        />
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
                <P class="font-bold"
                    >4. After registering, click the edit icon and copy your
                    Client ID:</P
                >
                <div class="mt-2">
                    <Input
                        bind:value={clientId}
                        placeholder="Enter your Client ID"
                        class="w-full"
                    />
                </div>
            </Li>
        </List>

        <div class="flex flex-col gap-4 items-center">
            <Button
                onclick={handleSubmit}
                disabled={!subdomain || !clientId}
                class="w-1/2 bg-amber hover:bg-amber-700"
                size="xl"
            >
                Complete Setup
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
