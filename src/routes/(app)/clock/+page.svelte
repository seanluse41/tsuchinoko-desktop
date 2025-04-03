<script>
    import { Card, Heading } from "svelte-5-ui-lib";
    import EggTimer from "../../../components/EggTimer.svelte";
    import { timerState, setDuration } from '$lib/app/appEggTimer.svelte.js';
    import { preferencesState } from "$lib/app/appPreferences.svelte";
    import { _ } from "svelte-i18n";
</script>

<div class="relative w-full h-full overflow-auto p-4 md:p-8">
    <Card
        class="max-w-none mx-auto md:p-10"
        style="background-color: {preferencesState.menuColor || '#D1C1E9'}"
    >
        <div class="text-center mb-8">
            <Heading level={1} class="text-4xl md:text-5xl font-bold text-slate-700 mb-4">
                {$_("eggTimer.title")}
            </Heading>
            <p class="text-slate-700">{$_("eggTimer.subtitle")}</p>
        </div>
        
        <div class="flex flex-col">
            <EggTimer />
        </div>
    </Card>
</div>