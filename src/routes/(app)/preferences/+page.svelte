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
        Button,
    } from "svelte-5-ui-lib";
    import { InfoCircleSolid } from "flowbite-svelte-icons";
    import {
        preferencesState,
        resetAllPreferences,
        resetColors,
        savePreferences,
    } from "$lib/app/appPreferences.svelte.js";
    import ColorPicker from "svelte-awesome-color-picker";
    import { _, locale } from "svelte-i18n";

    let currentLocale = preferencesState.language;

    const changeLocale = () => {
        if (currentLocale == "en") {
            locale.set("ja");
            currentLocale = "ja";
        } else if (currentLocale == "ja") {
            locale.set("en");
            currentLocale = "en";
        }
    };
</script>

<div class="relative w-full h-full overflow-auto p-8">
    <Card
        class="max-w-4xl mx-auto"
        style="background-color: {preferencesState.menuColor || '#D1C1E9'}"
    >
        <div class="space-y-8">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <span class="text-lg font-medium">{$_("preferences.logging")}</span>
                    <InfoCircleSolid
                        id="logging-info"
                        class="h-5 w-5 text-slate-600"
                    />
                    <Tooltip triggeredBy="#logging-info"
                        >{$_("preferences.loggingTooltip")}</Tooltip
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
                            {$_("preferences.off")}
                        </div>
                    {/snippet}
                    <div
                        class={preferencesState.loggingEnabled
                            ? "font-semibold"
                            : ""}
                    >
                        {$_("preferences.on")}
                    </div>
                </Toggle>
            </div>

            <!-- compact view -->
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <span class="text-lg font-medium">{$_("preferences.compactView")}</span>
                    <InfoCircleSolid
                        id="compact-info"
                        class="h-5 w-5 text-slate-600"
                    />
                    <Tooltip triggeredBy="#compact-info"
                        >{$_("preferences.compactViewTooltip")}</Tooltip
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
                            {$_("preferences.off")}
                        </div>
                    {/snippet}
                    <div
                        class={preferencesState.compact ? "font-semibold" : ""}
                    >
                        {$_("preferences.on")}
                    </div>
                </Toggle>
            </div>

            <!-- keep filter on search -->
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <span class="text-lg font-medium">{$_("preferences.keepFilterOnSearch")}</span>
                    <InfoCircleSolid
                        id="keepFilter-info"
                        class="h-5 w-5 text-slate-600"
                    />
                    <Tooltip triggeredBy="#keepFilter-info"
                        >{$_("preferences.keepFilterOnSearchTooltip")}</Tooltip
                    >
                </div>
                <Toggle
                    spanClass="w-16 h-10 after:top-1 after:left-[4px]  after:h-8 after:w-8"
                    bind:checked={preferencesState.keepFilterOnSearch}
                >
                    {#snippet leftLabel()}
                        <div
                            class="me-4 {!preferencesState.keepFilterOnSearch
                                ? 'font-semibold'
                                : ''}"
                        >
                            {$_("preferences.off")}
                        </div>
                    {/snippet}
                    <div
                        class={preferencesState.keepFilterOnSearch ? "font-semibold" : ""}
                    >
                        {$_("preferences.on")}
                    </div>
                </Toggle>
            </div>

            <div class="space-y-2">
                <div class="flex items-center gap-2">
                    <span class="text-lg font-medium"
                        >{$_("preferences.syncInterval")}</span
                    >
                    <InfoCircleSolid
                        id="sync-info"
                        class="h-5 w-5 text-slate-600"
                    />
                    <Tooltip triggeredBy="#sync-info"
                        >{$_("preferences.syncIntervalTooltip")}</Tooltip
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
                    >{$_("preferences.currentInterval", { values: { interval: preferencesState.syncTimer } })}</span
                >
            </div>

            <div class="space-y-2">
                <div class="flex items-center gap-2">
                    <span class="text-lg font-medium">{$_("preferences.language")}</span>
                    <InfoCircleSolid
                        id="lang-info"
                        class="h-5 w-5 text-slate-600"
                    />
                    <Tooltip triggeredBy="#lang-info"
                        >{$_("preferences.languageTooltip")}</Tooltip
                    >
                </div>
                <Select size="lg" bind:value={preferencesState.language} onchange={changeLocale}>
                    <option value="en">{$_("preferences.english")}</option>
                    <option value="ja">{$_("preferences.japanese")}</option>
                </Select>
            </div>

            <Hr hrClass="my-16" />
            <Heading level={2} class="mb-8 text-3xl font-bold text-slate-700"
                >{$_("preferences.colorSettings")}</Heading
            >

            <div class="grid grid-cols-2 gap-8">
                <div class="p-4 bg-white border rounded-3xl border-slate-700">
                    <span class="text-lg font-medium mb-2 block"
                        >{$_("preferences.menuColor")}</span
                    >
                    <ColorPicker
                        label={preferencesState.menuColor}
                        position="responsive"
                        bind:hex={preferencesState.menuColor}
                    />
                </div>

                <div class="p-4 bg-white border rounded-3xl border-slate-700">
                    <span class="text-lg font-medium mb-2 block"
                        >{$_("preferences.completedTaskColor")}</span
                    >
                    <ColorPicker
                        label={preferencesState.completedTaskColor}
                        position="responsive"
                        bind:hex={preferencesState.completedTaskColor}
                    />
                </div>

                <div class="p-4 bg-white border rounded-3xl border-slate-700">
                    <span class="text-lg font-medium mb-2 block"
                        >{$_("preferences.registeredTaskColor")}</span
                    >
                    <ColorPicker
                        label={preferencesState.registeredTaskColor}
                        position="responsive"
                        bind:hex={preferencesState.registeredTaskColor}
                    />
                </div>

                <div class="p-4 bg-white border rounded-3xl border-slate-700">
                    <span class="text-lg font-medium mb-2 block"
                        >{$_("preferences.overdueTaskColor")}</span
                    >
                    <ColorPicker
                        label={preferencesState.overdueTaskColor}
                        position="responsive"
                        bind:hex={preferencesState.overdueTaskColor}
                    />
                </div>
            </div>
            <Hr hrClass="my-16" />
            <div class="flex flex-row space-x-8">
                <Button
                    size="lg"
                    color="light"
                    class="border-slate-700 flex-grow w-1/4"
                    outline
                    onclick={resetColors}>{$_("preferences.resetColors")}</Button
                >
                <Button
                    size="lg"
                    color="light"
                    class="border-slate-700 w-1/4"
                    outline
                    onclick={resetAllPreferences}>{$_("preferences.resetAllPreferences")}</Button
                >
                <Button
                    size="lg"
                    class="border-slate-700 flex-grow w-1/2 mx-8 bg-moss_green-500 hover:bg-moss_green-400 active:bg-moss_green-300 text-white"
                    outline
                    onclick={savePreferences}>{$_("preferences.savePreferences")}</Button
                >
            </div>
        </div>
    </Card>
</div>