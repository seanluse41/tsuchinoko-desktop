<script>
    import { Card, Heading, Button, P, Textarea, Tooltip } from "svelte-5-ui-lib";
    import { FileCopyOutline, CheckCircleOutline, InfoCircleSolid } from "flowbite-svelte-icons";
    import { writeText } from "@tauri-apps/plugin-clipboard-manager";
    import { authState } from "$lib/app/appLoginManager.svelte.js";
    import { createToken, getExpiryDate } from "$lib/app/linkExtensionHelper.svelte.js";

    // State for the UI
    let copied = $state(false);
    let token = $state('');
    let expiryDate = $state('');
    
    // Create token on page load
    $effect(() => {
        generateToken();
    });

    async function generateToken() {
        // Validate required fields are available
        if (!authState.user.subdomain || !authState.user.domain || !authState.user.appId || 
            !authState.refreshToken || !authState.user.clientId || !authState.user.clientSecret) {
            token = 'Missing required information. Please ensure you are logged in and have a Tsuuchinoko app configured with proper OAuth credentials.';
            return;
        }
        
        // Get expiry date (15 minutes from now)
        const expiry = getExpiryDate();
        expiryDate = new Date(expiry).toLocaleString();
        
        // Create the token
        const payload = {
            subdomain: authState.user.subdomain,
            domain: authState.user.domain,
            username: authState.user.username || 'unknown',
            appId: authState.user.appId,
            clientId: authState.user.clientId,
            clientSecret: authState.user.clientSecret,
            refreshToken: authState.refreshToken,
            created: new Date().toISOString(),
            expires: expiry
        };
        console.log("payload")
        console.log(payload)
        
        token = await createToken(payload);
    }

    async function copyToClipboard() {
        try {
            await writeText(token);
            copied = true;
            setTimeout(() => {
                copied = false;
            }, 3000);
        } catch (err) {
            console.error("Failed to copy to clipboard:", err);
        }
    }
</script>

<div class="min-h-screen relative flex items-center justify-center p-4">
    <Card class="max-w-3xl w-full p-8">
        <Heading level={1} class="mb-4 text-2xl font-bold text-center">
            Link to Extension
        </Heading>
        
        <div class="mb-6 text-center">
            <P class="text-slate-700">
                Copy this token to clipboard and paste it into the Tsuuchinoko Chrome Extension to link your accounts.
            </P>
            <div class="flex items-center gap-2 justify-center mt-4 text-amber-600">
                <InfoCircleSolid class="h-5 w-5" />
                <P class="text-sm">
                    This token will expire in 15 minutes on {expiryDate}
                </P>
            </div>
        </div>
        
        <div class="mb-6 relative">
            <Textarea
                value={token}
                readonly 
                class="pr-12 w-full bg-slate-50 font-mono text-md"
                rows="7"
            />
            <Tooltip 
                triggeredBy="#copy-btn"
                placement="top"
            >
                {copied ? "Copied!" : "Copy to clipboard"}
            </Tooltip>
            <button 
                id="copy-btn"
                onclick={copyToClipboard} 
                class="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-600 hover:text-amber-600 focus:outline-none"
            >
                {#if copied}
                    <CheckCircleOutline class="h-6 w-6 text-moss_green-600" />
                {:else}
                    <FileCopyOutline class="h-6 w-6" />
                {/if}
            </button>
        </div>
        
        <div class="mt-8 flex justify-center">
            <Button
                onclick={generateToken}
                class="bg-thistle hover:bg-thistle-700"
            >
                Regenerate Token
            </Button>
        </div>
    </Card>
</div>