<script>
    import { Card, Heading } from "svelte-5-ui-lib";
    import EggTimer from "../../../components/EggTimer.svelte";
    import { timerState, setDuration } from '$lib/app/appEggTimer.svelte.js';
    import { preferencesState } from "$lib/app/appPreferences.svelte";
</script>

<div class="relative w-full h-full overflow-auto p-8">
    <Card
        class="max-w-none mx-auto"
        style="background-color: {preferencesState.menuColor || '#D1C1E9'}"
    >
        <div class="text-center mb-8">
            <Heading level={1} class="text-3xl md:text-5xl font-bold text-slate-700 mb-4">
                Egg Timer
            </Heading>
            <p class="text-slate-700">Set a timer and get things done!</p>
        </div>
        
        <div class="flex flex-col">
            <EggTimer />
        </div>
    </Card>
</div>