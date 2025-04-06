<!-- /components/SelectKintoneAppModal.svelte -->
<script>
    import { Modal, Button, Heading, uiHelpers, Radio, Spinner } from 'svelte-5-ui-lib';
    import { _ } from "svelte-i18n";
    import { getAllApps } from "$lib/kintone/kintoneCheckForApp.svelte.js";
    import { authState } from "$lib/app/appLoginManager.svelte.js";
    import { secretManager } from "$lib/app/appSecretManager.svelte.js";
    
    let { modalUI = uiHelpers() } = $props();
    
    // Apps list state
    let apps = $state([]);
    let isLoading = $state(false);
    let error = $state(null);
    let selectedAppId = $state(null);
    
    let modalStatus = $state(false);
    const closeModal = modalUI.close;
    
    // Load apps when modal opens
    $effect(() => {
        modalStatus = modalUI.isOpen;
        
        if (modalStatus) {
            loadApps();
        }
    });
    
    async function loadApps() {
        isLoading = true;
        error = null;
        selectedAppId = null;
        
        try {
            apps = await getAllApps();
            console.log("Loaded apps:", apps);
        } catch (err) {
            console.error("Error loading apps:", err);
            error = err.message || "Failed to load apps";
            apps = [];
        } finally {
            isLoading = false;
        }
    }
    
    function selectApp(appId) {
        selectedAppId = appId;
    }
    
    async function beginConnection() {
        if (!selectedAppId) {
            error = "Please select an app";
            return;
        }
        try {
            console.log(`Selected app ID: ${selectedAppId}`);
            
            // Store the selected app ID in auth state
            authState.user.appId = selectedAppId;
            isLoading = true;
            // Save the updated credentials
            await secretManager.storeCredentials();
            isLoading = false;
            // Close the modal
            closeModal();
        } catch (err) {
            console.error("Error setting app ID:", err);
            error = err.message || "Failed to connect to app";
        }
    }
</script>

<Modal size="md" {modalStatus} {closeModal}>
    <Heading level={2} class="mb-4 text-xl font-medium text-slate-700">
        Select the Kintone App to Use
    </Heading>
    
    {#if error}
        <div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {error}
        </div>
    {/if}
    
    <div class="max-h-64 overflow-y-auto border border-slate-300 rounded-lg p-4 mb-4">
        {#if isLoading}
            <div class="flex justify-center items-center py-6">
                <Spinner size="8" color="thistle" />
                <span class="ml-3">Loading apps...</span>
            </div>
        {:else if apps.length === 0}
            <p class="text-center py-4 text-red-500">
                No apps found in space ID: {authState.user.spaceId || 'unknown'}
            </p>
        {:else}
            <div class="space-y-2">
                {#each apps as app}
                    <div class="p-2 hover:bg-slate-100 rounded-lg">
                        <Radio
                            name="app-selection"
                            value={app.appId}
                            checked={selectedAppId === app.appId}
                            onclick={() => selectApp(app.appId)}
                            labelClass="flex flex-col"
                        >
                            <span class="font-medium">{app.name}</span>
                            <span class="text-xs text-slate-500">ID: {app.appId}</span>
                        </Radio>
                    </div>
                {/each}
            </div>
        {/if}
    </div>
    
    {#snippet footer()}
        <Button 
            onclick={beginConnection}
            class="bg-thistle hover:bg-thistle-600"
            disabled={!selectedAppId || isLoading}
        >
            Begin Connection
        </Button>
        <Button 
            color="alternative" 
            onclick={closeModal}
            disabled={isLoading}
        >
            Cancel
        </Button>
    {/snippet}
</Modal>