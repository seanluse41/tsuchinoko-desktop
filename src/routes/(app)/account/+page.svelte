<!-- src/routes/(app)/account/+page.svelte -->
<script>
    import {
        Card,
        Button,
        Heading,
        P,
        Hr,
        Alert,
        List,
        Li,
        Modal,
        uiHelpers,
    } from "svelte-5-ui-lib";
    import {
        InfoCircleSolid,
        ExclamationCircleOutline,
    } from "flowbite-svelte-icons";
    import { authState } from "$lib/app/appLoginManager.svelte.js";
    import { preferencesState } from "$lib/app/appPreferences.svelte";
    import { secretManager } from "$lib/app/appSecretManager.svelte.js";
    import { checkForTsuuchinokoApp } from "$lib/kintone/kintoneCheckForApp.svelte.js";
    import { createTsuuchinokoApp } from "$lib/kintone/kintoneCreateApp.svelte.js";
    import {
        diagnoseApp,
        repairApp,
        removeTsuuchinokoApp,
    } from "$lib/kintone/kintoneDiagnoseApp.svelte.js";

    // Alert state
    let resultMessage = $state("");
    let resultDetails = $state([]);
    let alertStatus = $state(false);
    let alertType = $state("success");

    // Modal state
    const errorModal = uiHelpers();
    let modalStatus = $state(false);
    let errorTitle = $state("");
    let errorMessage = $state("");
    let errorDetails = $state([]);

    // Processing state
    let isProcessing = $state(false);
    let diagnosisResult = $state(null);

    // Modal close function
    const closeModal = errorModal.close;
    $effect(() => {
        modalStatus = errorModal.isOpen;
    });

    // Function to show error modal
    function showErrorModal(title, message, details = []) {
        errorTitle = title;
        errorMessage = message;
        errorDetails = details;
        errorModal.toggle();
    }

    // Function to show success alert
    function showSuccessAlert(message, details = []) {
        resultMessage = message;
        resultDetails = details;
        alertStatus = true;
        alertType = "success";
    }

    async function importTasks() {
        alertStatus = false;
        showErrorModal(
            "Feature Coming Soon",
            "Task import feature is not yet available",
            [
                "This feature will allow you to import tasks from a CSV file in a future update.",
            ],
        );
    }

    async function diagnoseKintoneApp() {
        try {
            isProcessing = true;
            alertStatus = false;

            diagnosisResult = await diagnoseApp();
            console.log("Diagnosis result:", diagnosisResult);

            if (diagnosisResult.status === "success") {
                showSuccessAlert(
                    diagnosisResult.message,
                    diagnosisResult.details,
                );
            } else if (
                diagnosisResult.status === "warning" &&
                diagnosisResult.needsRepair
            ) {
                showErrorModal(
                    "App Needs Repair",
                    diagnosisResult.message,
                    diagnosisResult.details,
                );
            } else {
                showErrorModal(
                    "Diagnosis Warning",
                    diagnosisResult.message,
                    diagnosisResult.details,
                );
            }
        } catch (error) {
            console.error("Error diagnosing app:", error);
            showErrorModal(
                "Diagnosis Error",
                `Error: ${error.message || error}`,
                [String(error)],
            );
            diagnosisResult = null;
        } finally {
            isProcessing = false;
        }
    }

    async function repairKintoneApp() {
        try {
            if (
                !diagnosisResult ||
                !diagnosisResult.needsRepair ||
                !diagnosisResult.diagnosisData
            ) {
                showErrorModal(
                    "Cannot Repair",
                    "Please run diagnosis first to identify issues",
                );
                return;
            }

            isProcessing = true;
            alertStatus = false;

            const result = await repairApp(diagnosisResult.diagnosisData);

            if (result.status === "success") {
                showSuccessAlert(result.message, result.details);
                // If repair was successful, clear the diagnosis result
                diagnosisResult = null;
            } else {
                showErrorModal(
                    result.status === "warning"
                        ? "Repair Warning"
                        : "Repair Failed",
                    result.message,
                    result.details,
                );
            }
        } catch (error) {
            console.error("Error repairing app:", error);
            showErrorModal("Repair Error", `Error: ${error.message || error}`, [
                String(error),
            ]);
        } finally {
            isProcessing = false;
        }
    }

    async function detectApp() {
        try {
            isProcessing = true;
            alertStatus = false;

            const result = await checkForTsuuchinokoApp();
            console.log("Check for app result:", result);

            if (result.exists) {
                showSuccessAlert(
                    `Found Tsuuchinoko app with ID: ${result.appId}`,
                    ["App connection established successfully."],
                );
                // Clear any previous diagnosis
                diagnosisResult = null;
            } else {
                showErrorModal(
                    "App Not Found",
                    "Tsuuchinoko app was not detected",
                    ["You may need to create a new app."],
                );
            }
        } catch (error) {
            console.error("Error checking for app:", error);
            showErrorModal(
                "Detection Error",
                `Error: ${error.message || error}`,
                [String(error)],
            );
        } finally {
            isProcessing = false;
        }
    }

    async function createApp() {
        try {
            isProcessing = true;
            alertStatus = false;

            const result = await createTsuuchinokoApp();

            if (result.success) {
                showSuccessAlert(
                    `Created Tsuuchinoko app with ID: ${result.appId}`,
                    ["App created and connected successfully."],
                );
                // Clear any previous diagnosis
                diagnosisResult = null;
            } else {
                showErrorModal("Creation Failed", `Error: ${result.error}`, [
                    result.message || "Failed to create app.",
                ]);
            }
        } catch (error) {
            console.error("Error creating app:", error);
            showErrorModal(
                "Creation Error",
                `Error: ${error.message || error}`,
                [String(error)],
            );
        } finally {
            isProcessing = false;
        }
    }

    async function removeApp() {
        try {
            isProcessing = true;
            alertStatus = false;

            const result = await removeTsuuchinokoApp();

            // Also save to secure storage
            if (result.status === "success") {
                await secretManager.storeCredentials();
                diagnosisResult = null;
                showSuccessAlert(result.message);
            } else {
                showErrorModal("Removal Failed", result.message);
            }
        } catch (error) {
            console.error("Error removing app:", error);
            showErrorModal(
                "Removal Error",
                `Error: ${error.message || error}`,
                [String(error)],
            );
        } finally {
            isProcessing = false;
        }
    }

    function closeAlert() {
        alertStatus = false;
    }

    let canRepair = $derived(diagnosisResult && diagnosisResult.needsRepair);
</script>

<div class="relative w-full h-full overflow-auto p-8">
    <Card
        class="max-w-none p-8"
        style="background-color: {preferencesState.menuColor || '#D1C1E9'}"
    >
        <Heading level={1} class="text-4xl font-bold mb-6 text-slate-700"
            >Account Settings</Heading
        >

        <!-- Success Alert -->
        <Alert
            color="green"
            border
            dismissable={true}
            {alertStatus}
            {closeAlert}
            class="mb-6"
        >
            {#snippet icon()}
                <InfoCircleSolid class="h-5 w-5" />
            {/snippet}
            <div>
                <p class="font-medium">{resultMessage}</p>
                {#if resultDetails && resultDetails.length > 0}
                    <List class="mt-2 ml-4">
                        {#each resultDetails as detail}
                            <Li class="text-sm">{detail}</Li>
                        {/each}
                    </List>
                {/if}
            </div>
        </Alert>

        <!-- Error/Warning Modal -->
        <Modal size="md" {modalStatus} {closeModal}>
            <div class="text-center">
                <ExclamationCircleOutline
                    class="mx-auto mb-4 h-12 w-12 text-amber-400"
                />

                <h3 class="mb-2 text-xl font-medium text-slate-700">
                    {errorTitle}
                </h3>
                <p class="mb-4 text-slate-600">{errorMessage}</p>

                {#if errorDetails && errorDetails.length > 0}
                    <div class="mb-5 text-left bg-slate-50 p-4 rounded-lg">
                        <List>
                            {#each errorDetails as detail}
                                <Li class="text-sm text-slate-600">{detail}</Li>
                            {/each}
                        </List>
                    </div>
                {/if}

                <div class="flex justify-center gap-4">
                    {#if canRepair && errorTitle === "App Needs Repair"}
                        <Button
                            onclick={() => {
                                closeModal();
                                repairKintoneApp();
                            }}
                            class="bg-moss_green hover:bg-moss_green-600 text-white"
                        >
                            Repair App Now
                        </Button>
                    {/if}
                    <Button
                        onclick={closeModal}
                        class="bg-thistle hover:bg-thistle-700"
                    >
                        Close
                    </Button>
                </div>
            </div>
        </Modal>

        <div class="bg-white rounded-lg p-6 mb-6 border border-slate-200">
            <Heading level={2} class="text-2xl font-bold mb-4 text-slate-700"
                >Account Information</Heading
            >
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
            <Heading level={2} class="text-2xl font-bold mb-4 text-slate-700"
                >Tsuuchinoko App Management</Heading
            >
            <P class="mb-6">
                Manage your Tsuuchinoko app settings and integration with
                Kintone.
            </P>

            <div class="grid grid-cols-2 gap-4">
                <Button
                    onclick={diagnoseKintoneApp}
                    class="bg-amber hover:bg-amber-600 mb-4 text-slate-700"
                    disabled={isProcessing || !authState.user.appId}
                >
                    Diagnose App
                </Button>

                <Button
                    onclick={importTasks}
                    class="bg-thistle hover:bg-thistle-600 mb-4 text-slate-700"
                    disabled={isProcessing || !authState.user.appId}
                >
                    Import Tasks
                </Button>
            </div>

            <div
                class="mt-4 p-4 bg-amber-100 rounded-lg border border-amber-300"
            >
                <P class="text-amber-800">
                    <strong>Note:</strong> "Diagnose App" checks if your Kintone
                    app has all the required fields and configuration. If issues
                    are found, you'll be given the option to repair the app automatically.
                </P>
            </div>
        </div>
    </Card>
</div>
