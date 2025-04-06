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
    import SelectKintoneAppModal from "../../../components/SelectKintoneAppModal.svelte";
    import {
        diagnoseApp,
        repairApp,
        removeTsuuchinokoApp,
    } from "$lib/kintone/kintoneDiagnoseApp.svelte.js";
    import { createSpace } from "$lib/kintone/kintoneCreateSpace.svelte.js";
    import { _ } from "svelte-i18n";

    // Alert state
    let resultMessage = $state("");
    let resultDetails = $state([]);
    let alertStatus = $state(false);
    let alertType = $state("success");

    // Modal state
    const errorModal = uiHelpers();
    const selectAppModalUI = uiHelpers();
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
            $_("account.featureComingSoon"),
            $_("account.importFeatureUnavailable"),
            [$_("account.importFutureFeature")],
        );
    }

    async function testCreateSpace() {
        console.log("Testing space creation...");
        try {
            const result = await createSpace("Tsuuchinoko Test Space");
            if (result.success) {
                console.log(
                    `Space created successfully! Space ID: ${result.spaceId}`,
                );
                // You could also show a success alert here if you want
                showSuccessAlert("Space created successfully!", [
                    `Space ID: ${result.spaceId}`,
                ]);
            } else {
                console.error("Failed to create space");
                // Or show an error modal
                showErrorModal("Debug Error", "Failed to create space", [
                    "This could be due to permissions or API limitations",
                ]);
            }
        } catch (error) {
            console.error("Error in space creation test:", error);
            showErrorModal(
                "Debug Error",
                `Error creating space: ${error.message || error}`,
            );
        }
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
                    $_("account.appNeedsRepair"),
                    diagnosisResult.message,
                    diagnosisResult.details,
                );
            } else {
                showErrorModal(
                    $_("account.diagnosisWarning"),
                    diagnosisResult.message,
                    diagnosisResult.details,
                );
            }
        } catch (error) {
            console.error("Error diagnosing app:", error);
            showErrorModal(
                $_("account.diagnosisError"),
                `${$_("account.error")}: ${error.message || error}`,
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
                    $_("account.cannotRepair"),
                    $_("account.runDiagnosisFirst"),
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
                        ? $_("account.repairWarning")
                        : $_("account.repairFailed"),
                    result.message,
                    result.details,
                );
            }
        } catch (error) {
            console.error("Error repairing app:", error);
            showErrorModal(
                $_("account.repairError"),
                `${$_("account.error")}: ${error.message || error}`,
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

<div class="relative w-full h-full overflow-auto p-4 md:p-8">
    <Card
        class="max-w-none p-0 md:p-8"
        style="background-color: {preferencesState.menuColor || '#D1C1E9'}"
    >
        <Heading
            level={1}
            class="text-3xl md:text-5xl text-center font-bold mb-6 text-slate-700"
            >{$_("account.accountSettings")}</Heading
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
                    {#if canRepair && errorTitle === $_("account.appNeedsRepair")}
                        <Button
                            onclick={() => {
                                closeModal();
                                repairKintoneApp();
                            }}
                            class="bg-moss_green hover:bg-moss_green-600 text-white"
                        >
                            {$_("account.repairAppNow")}
                        </Button>
                    {/if}
                    <Button
                        onclick={closeModal}
                        class="bg-thistle hover:bg-thistle-700"
                    >
                        {$_("account.close")}
                    </Button>
                </div>
            </div>
        </Modal>

        <div class="bg-white rounded-lg p-6 mb-6 border border-slate-200">
            <Heading level={2} class="text-2xl font-bold mb-4 text-slate-700"
                >{$_("account.accountInformation")}</Heading
            >
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <P class="font-semibold">{$_("account.subdomain")}:</P>
                    <P class="mb-4"
                        >{authState.user.subdomain || $_("account.notSet")}</P
                    >
                </div>
                <div>
                    <P class="font-semibold">{$_("account.domain")}:</P>
                    <P class="mb-4"
                        >{authState.user.domain || $_("account.notSet")}</P
                    >
                </div>
                <div>
                    <P class="font-semibold">{$_("account.appId")}:</P>
                    <P class="mb-4"
                        >{authState.user.appId || $_("account.notSet")}</P
                    >
                </div>
                <div>
                    <P class="font-semibold">{$_("account.username")}:</P>
                    <P class="mb-4"
                        >{authState.user.username || $_("account.notSet")}</P
                    >
                </div>
            </div>
        </div>

        <Hr hrClass="my-8" />

        <div class="bg-white rounded-lg p-6 border border-slate-200">
            <Heading level={2} class="text-2xl font-bold mb-4 text-slate-700"
                >{$_("account.appManagement")}</Heading
            >
            <P class="mb-6">
                {$_("account.appManagementDescription")}
            </P>

            <div class="flex flex-col md:flex-row gap-3 md:gap-4 mb-4">
                <Button
                    onclick={selectAppModalUI.toggle}
                    class="bg-thistle hover:bg-thistle-600 text-slate-700 md:w-1/2"
                    disabled={isProcessing}
                >
                    {$_("account.selectConnectedApp")}
                </Button>
                <Button
                    onclick={diagnoseKintoneApp}
                    class="bg-amber hover:bg-amber-600 text-slate-700 md:w-1/4"
                    disabled={isProcessing || !authState.user.appId}
                >
                    {$_("account.diagnoseApp")}
                </Button>

                <Button
                    onclick={importTasks}
                    class="bg-moss_green hover:bg-moss_green-600  text-white md:w-1/4"
                    disabled={isProcessing || !authState.user.appId}
                >
                    {$_("account.importTasks")}
                </Button>
            </div>

            <div
                class="mt-4 p-4 bg-amber-100 rounded-lg border border-amber-300"
            >
                <P class="text-amber-800">
                    <strong>{$_("account.note")}:</strong>
                    {$_("account.diagnoseAppDescription")}
                </P>
            </div>
        </div>
    </Card>
</div>

<SelectKintoneAppModal modalUI={selectAppModalUI} />
