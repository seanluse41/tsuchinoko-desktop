<!-- src/routes/(app)/preferences/+page.svelte -->
<script>
    import {
        Card,
        Heading,
        Toggle,
        Range,
        Select,
        Tooltip,
        Hr,
    } from "svelte-5-ui-lib";
    import { InfoCircleSolid } from "flowbite-svelte-icons";
    import { preferencesState } from "$lib/app/appPreferences.svelte.js";
    import ColorPicker from "svelte-awesome-color-picker";

    $effect(() => {
        $inspect(preferencesState);
    });
</script>

<div class="p-8 relative">
    <Card class="max-w-4xl mx-auto" style="background-color: {preferencesState.menuColor || '#D1C1E9'}">        >

        <div class="space-y-8">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <span class="text-lg font-medium">Activity Logging</span>
                    <InfoCircleSolid
                        id="logging-info"
                        class="h-5 w-5 text-slate-600"
                    />
                    <Tooltip triggeredBy="#logging-info"
                        >Track task actions and navigation history</Tooltip
                    >
                </div>
                <Toggle
                    spanClass="w-16 h-10 after:top-1 after:left-[4px]  after:h-8 after:w-8"
                    bind:checked={preferencesState.loggingEnabled}
                >
                    {#snippet leftLabel()}
                        <div
                            class="me-4 {!preferencesState.loggingEnabled
                                ? 'font-semibold'
                                : ''}"
                        >
                            Off
                        </div>
                    {/snippet}
                    <div
                        class={preferencesState.loggingEnabled
                            ? "font-semibold"
                            : ""}
                    >
                        On
                    </div>
                </Toggle>
            </div>

            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <span class="text-lg font-medium">Compact View</span>
                    <InfoCircleSolid
                        id="compact-info"
                        class="h-5 w-5 text-slate-600"
                    />
                    <Tooltip triggeredBy="#compact-info"
                        >Reduce spacing between task items</Tooltip
                    >
                </div>
                <Toggle
                    spanClass="w-16 h-10 after:top-1 after:left-[4px]  after:h-8 after:w-8"
                    bind:checked={preferencesState.compact}
                >
                    {#snippet leftLabel()}
                        <div
                            class="me-4 {!preferencesState.compact
                                ? 'font-semibold'
                                : ''}"
                        >
                            Off
                        </div>
                    {/snippet}
                    <div
                        class={preferencesState.compact ? "font-semibold" : ""}
                    >
                        On
                    </div>
                </Toggle>
            </div>

            <div class="space-y-2">
                <div class="flex items-center gap-2">
                    <span class="text-lg font-medium"
                        >Sync Interval (minutes)</span
                    >
                    <InfoCircleSolid
                        id="sync-info"
                        class="h-5 w-5 text-slate-600"
                    />
                    <Tooltip triggeredBy="#sync-info"
                        >How often to check for task updates</Tooltip
                    >
                </div>
                <Range
                    rangeSize="lg"
                    color="violet"
                    min="5"
                    max="60"
                    step="5"
                    bind:value={preferencesState.syncTimer}
                />
                <span class="text-sm text-slate-600"
                    >Current: {preferencesState.syncTimer} minutes</span
                >
            </div>

            <div class="space-y-2">
                <div class="flex items-center gap-2">
                    <span class="text-lg font-medium">Language / 言語</span>
                    <InfoCircleSolid
                        id="lang-info"
                        class="h-5 w-5 text-slate-600"
                    />
                    <Tooltip triggeredBy="#lang-info"
                        >Interface language</Tooltip
                    >
                </div>
                <Select size="lg" bind:value={preferencesState.language}>
                    <option value="en">English</option>
                    <option value="ja">日本語</option>
                </Select>
            </div>

            <Hr hrClass="my-16" />
            <Heading level={2} class="mb-8 text-3xl font-bold text-slate-700"
                >Color Settings</Heading
            >

            <div class="grid grid-cols-2 gap-8">
                <div>
                    <span class="text-lg font-medium mb-2 block"
                        >Menu Color</span
                    >
                    <ColorPicker
                        label={preferencesState.menuColor}
                        position="responsive"
                        onInput={(event) => {
                            preferencesState.menuColor = event.hex;
                        }}
                    />
                </div>

                <div>
                    <span class="text-lg font-medium mb-2 block"
                        >Completed Task Color</span
                    >
                    <ColorPicker
                        label={preferencesState.completedTaskColor}
                        position="responsive"
                        onInput={(event) => {
                            preferencesState.completedTaskColor = event.hex;
                        }}
                    />
                </div>

                <div>
                    <span class="text-lg font-medium mb-2 block"
                        >Registered Task Color</span
                    >
                    <ColorPicker
                        position="responsive"
                        onInput={(event) => {
                            preferencesState.registeredTaskColor = event.hex;
                        }}
                    />
                </div>

                <div>
                    <span class="text-lg font-medium mb-2 block"
                        >Overdue Task Color</span
                    >
                    <ColorPicker
                        position="responsive"
                        onInput={(event) => {
                            preferencesState.overdueTaskColor = event.hex;
                        }}
                    />
                </div>
            </div>
        </div>
    </Card>
</div>
