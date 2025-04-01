// src/lib/os/updater.svelte.js

export const updaterState = $state({
    isChecking: false,
    updateAvailable: false,
    updateInfo: {
        version: '',
        date: '',
        notes: ''
    },
    isDownloading: false,
    downloadProgress: 0,
    downloadStatus: '',
    installComplete: false,
    error: null
});

let currentUpdateObject = null;

export async function checkForUpdates() {
    try {
        updaterState.isChecking = true;
        updaterState.error = null;
        console.log("Checking for updates...");
        
        const { check } = await import('@tauri-apps/plugin-updater');
        const { getVersion } = await import('@tauri-apps/api/app');
        
        const currentVersion = await getVersion();
        console.log(`Current version: ${currentVersion}`);
        
        try {
            const update = await check();
            
            if (update) {
                console.log(`Update available! Latest version: ${update.version}`);
                
                // Process update info
                let formattedDate = 'Unknown date';
                if (update.rawJson && update.rawJson.pub_date) {
                    try {
                        const dateObj = new Date(update.rawJson.pub_date);
                        if (!isNaN(dateObj.getTime())) {
                            formattedDate = dateObj.toLocaleString();
                        }
                    } catch (dateError) {
                        console.error("Error formatting date:", dateError);
                    }
                }
                
                updaterState.updateAvailable = true;
                updaterState.updateInfo = {
                    version: update.version || 'Unknown',
                    date: formattedDate,
                    notes: (update.body) ? update.body : 'No release notes available'
                };
                
                // Store the update object for later use
                currentUpdateObject = update;
                
                return true;
            } else {
                console.log("No updates available. You're running the latest version.");
                updaterState.updateAvailable = false;
                return false;
            }
        } catch (checkError) {
            console.error("Error during update check:", checkError);
            // Don't modify the error message at all
            throw checkError;
        }
    } catch (error) {
        console.error("Final error catch:", error);
        updaterState.error = error.message || "Unknown error during update check";
        throw error;
    } finally {
        updaterState.isChecking = false;
    }
}

export async function downloadAndInstallUpdate() {
    try {
        if (!currentUpdateObject) {
            updaterState.error = "No update available to install";
            return false;
        }

        // Reset state
        updaterState.isDownloading = true;
        updaterState.downloadStatus = "Preparing download...";
        updaterState.downloadProgress = 0;
        updaterState.error = null;

        let downloaded = 0;
        let contentLength = 0;

        // Download and install
        await currentUpdateObject.downloadAndInstall((event) => {
            switch (event.event) {
                case 'Started':
                    contentLength = event.data.contentLength || 100;
                    updaterState.downloadStatus = "Downloading update...";
                    console.log(`Started downloading ${contentLength} bytes`);
                    break;
                case 'Progress':
                    downloaded += event.data.chunkLength;
                    if (contentLength > 0) {
                        updaterState.downloadProgress = Math.round((downloaded / contentLength) * 100);
                    }
                    updaterState.downloadStatus = `Downloaded ${updaterState.downloadProgress}%`;
                    console.log(`Downloaded ${downloaded} of ${contentLength} bytes (${updaterState.downloadProgress}%)`);
                    break;
                case 'Finished':
                    updaterState.downloadStatus = "Download complete! Installing...";
                    updaterState.downloadProgress = 100;
                    console.log('Download finished');
                    break;
            }
        });

        console.log('Update installed successfully');
        updaterState.isDownloading = false;
        updaterState.installComplete = true;
        return true;

    } catch (error) {
        console.error('Error during download or install:', error);
        updaterState.isDownloading = false;
        updaterState.error = error.message || 'Unknown error during installation';
        throw error;
    }
}

export async function restartApplication() {
    try {
        const { relaunch } = await import('@tauri-apps/plugin-process');
        console.log('Restarting application...');
        await relaunch();
    } catch (error) {
        console.error('Error restarting application:', error);
        updaterState.error = error.message || 'Unknown error during restart';
        throw error;
    }
}