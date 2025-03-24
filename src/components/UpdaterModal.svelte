<!-- src/components/UpdaterModal.svelte -->
<script>
    import { Modal, Button, P, Heading } from "svelte-5-ui-lib";
    import { 
        updaterState, 
        downloadAndInstallUpdate, 
        restartApplication
    } from "$lib/os/updater.svelte.js";
    
    let { 
        modalStatus = false,  // Allow controlling visibility from parent
        closeModal = () => {},  // Allow custom close handler
    } = $props();
    
    // Handle download and install
    async function handleDownload() {
        try {
            await downloadAndInstallUpdate();
        } catch (error) {
            console.error("Failed to download update:", error);
        }
    }
    
    // Handle restart
    async function handleRestart() {
        try {
            await restartApplication();
        } catch (error) {
            console.error("Failed to restart:", error);
        }
    }
</script>

<Modal 
    size="md" 
    {modalStatus} 
    {closeModal}
>
    <div class="text-center">
        {#if updaterState.error}
            <!-- Error state -->
            <div class="mb-4 p-4 bg-redwood-100 text-redwood-800 rounded-lg">
                <Heading level={2} class="mb-2 text-xl font-semibold">Update Error</Heading>
                <P>{updaterState.error}</P>
            </div>
            <Button 
                onclick={closeModal}
                class="bg-thistle hover:bg-thistle-700"
            >
                Close
            </Button>
        {:else if !updaterState.isDownloading && !updaterState.installComplete}
            <!-- Update available state -->
            <Heading level={2} class="mb-4 text-xl font-semibold">Update Available!</Heading>
            <P class="mb-2">Version: {updaterState.updateInfo.version}</P>
            <P class="mb-2">Released: {updaterState.updateInfo.date}</P>
            <div class="mb-4 p-4 bg-slate-50 rounded-lg">
                <P class="text-left">Release Notes:</P>
                <P class="text-left">{updaterState.updateInfo.notes}</P>
            </div>
            <div class="flex justify-center gap-4">
                <Button 
                    onclick={handleDownload}
                    class="bg-moss_green hover:bg-moss_green-600 text-white"
                >
                    Download & Install
                </Button>
                <Button 
                    onclick={closeModal}
                    class="bg-thistle hover:bg-thistle-700"
                >
                    Later
                </Button>
            </div>
        {:else if updaterState.isDownloading && !updaterState.installComplete}
            <!-- Downloading state -->
            <Heading level={2} class="mb-4 text-xl font-semibold">Downloading Update</Heading>
            <P class="mb-4">{updaterState.downloadStatus}</P>
            <div class="w-full bg-gray-200 rounded-full h-2.5 mb-6">
                <div 
                    class="bg-moss_green h-2.5 rounded-full" 
                    style="width: {updaterState.downloadProgress}%"
                ></div>
            </div>
            <P class="text-sm text-slate-600">Please don't close the application during update</P>
        {:else}
            <!-- Install complete state -->
            <Heading level={2} class="mb-4 text-xl font-semibold">Update Complete!</Heading>
            <P class="mb-6">The application needs to restart to apply the update.</P>
            <div class="flex justify-center gap-4">
                <Button 
                    onclick={handleRestart}
                    class="bg-moss_green hover:bg-moss_green-600 text-white"
                >
                    Restart Now
                </Button>
                <Button 
                    onclick={closeModal}
                    class="bg-thistle hover:bg-thistle-700"
                >
                    Later
                </Button>
            </div>
        {/if}
    </div>
</Modal>