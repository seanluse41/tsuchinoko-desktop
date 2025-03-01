<!-- src/routes/(app)/account/+page.svelte -->
<script>
    import { Card, Button, Heading, P, Hr, Alert } from "svelte-5-ui-lib";
    import { authState } from "$lib/app/appLoginManager.svelte.js";
    import { preferencesState } from "$lib/app/appPreferences.svelte";
    import { getAllApps, checkForTsuuchinokoApp, getCurrentAppId } from "$lib/kintone/kintoneCheckForApp.svelte.js";

    let resultMessage = $state("");
    let isProcessing = $state(false);
    let alertStatus = $state(false);
    let alertType = $state("info");

    async function testCheckForApp() {
        try {
            isProcessing = true;
            resultMessage = "Checking for Tsuuchinoko app...";
            alertStatus = true;
            alertType = "info";
            
            const result = await checkForTsuuchinokoApp();
            console.log("Check for app result:", result);
            
            if (result.exists) {
                resultMessage = `Found Tsuuchinoko app with ID: ${result.appId}`;
                alertType = "success";
            } else {
                resultMessage = "Tsuuchinoko app not found";
                alertType = "warning";
            }
        } catch (error) {
            console.error("Error checking for app:", error);
            resultMessage = `Error: ${error.message || error}`;
            alertType = "error";
        } finally {
            isProcessing = false;
        }
    }

    function testCreateApp() {
        console.log("Testing create app...");
        console.log("Auth state:", authState);
        resultMessage = "Create app test initiated - see console";
        alertStatus = true;
        alertType = "info";
    }

    async function testGetAllApps() {
        try {
            isProcessing = true;
            resultMessage = "Getting all apps...";
            alertStatus = true;
            alertType = "info";
            
            const apps = await getAllApps();
            console.log("All apps:", apps);
            resultMessage = `Found ${apps.length} apps`;
            alertType = "success";
        } catch (error) {
            console.error("Error getting apps:", error);
            resultMessage = `Error: ${error.message || error}`;
            alertType = "error";
        } finally {
            isProcessing = false;
        }
    }

    function showCurrentAppId() {
        try {
            const appId = getCurrentAppId();
            console.log("Current app ID:", appId);
            resultMessage = `Current app ID: ${appId}`;
            alertStatus = true;
            alertType = "info";
        } catch (error) {
            console.error("Error getting app ID:", error);
            resultMessage = `Error: ${error.message || error}`;
            alertStatus = true;
            alertType = "error";
        }
    }

    function clearAppId() {
        authState.user.appId = null;
        resultMessage = "App ID cleared from memory";
        alertStatus = true;
        alertType = "warning";
    }

    function closeAlert() {
        alertStatus = false;
    }
</script>

<div class="relative w-full h-full overflow-auto p-8">
    <Card class="max-w-none p-8" style="background-color: {preferencesState.menuColor || '#D1C1E9'}">
        <Heading level={1} class="text-4xl font-bold mb-6 text-slate-700">Account Settings</Heading>
        
        <Alert 
            color={alertType === "success" ? "green" : alertType === "error" ? "red" : alertType === "warning" ? "yellow" : "blue"}
            dismissable={true} 
            {alertStatus} 
            closeAlert={closeAlert} 
            class="mb-6"
        >
            {resultMessage}
        </Alert>
        
        <div class="bg-white rounded-lg p-6 mb-6 border border-slate-200">
            <Heading level={2} class="text-2xl font-bold mb-4 text-slate-700">Account Information</Heading>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <P class="font-semibold">Subdomain:</P>
                    <P class="mb-4">{authState.user.subdomain || "Not set"}</P>
                </div>
                <div>
                    <P class="font-semibold">Domain:</P>
                    <P class="mb-4">{authState.user.domain || "Not set"}</P>
                </div>
            </div>
            <div>
                <P class="font-semibold">App ID:</P>
                <P class="mb-4">{authState.user.appId || "Not set"}</P>
            </div>
        </div>

        <Hr hrClass="my-8" />

        <div class="bg-white rounded-lg p-6 border border-slate-200">
            <Heading level={2} class="text-2xl font-bold mb-4 text-slate-700">Tsuuchinoko App Debugging</Heading>
            <P class="mb-6 text-red-600">Warning: These functions are for development and debugging purposes only.</P>
            
            <div class="grid grid-cols-2 gap-4">
                <Button 
                    onclick={testCheckForApp}
                    class="bg-thistle hover:bg-thistle-600 mb-4"
                    disabled={isProcessing}
                >
                    Detect App ID
                </Button>
                
                <Button 
                    onclick={testGetAllApps}
                    class="bg-thistle hover:bg-thistle-600 mb-4"
                    disabled={isProcessing}
                >
                    Get All Apps
                </Button>
                
                <Button 
                    onclick={testCreateApp}
                    class="bg-moss_green hover:bg-moss_green-600 text-white mb-4"
                    disabled={isProcessing}
                >
                    Create App
                </Button>
                
                <Button 
                    onclick={showCurrentAppId}
                    class="bg-amber hover:bg-amber-600 mb-4"
                    disabled={isProcessing}
                >
                    Show Current App ID
                </Button>
                
                <Button 
                    onclick={clearAppId}
                    class="bg-redwood hover:bg-redwood-600 text-white mb-4"
                    disabled={isProcessing}
                >
                    Clear App ID
                </Button>
            </div>
        </div>
    </Card>
</div>