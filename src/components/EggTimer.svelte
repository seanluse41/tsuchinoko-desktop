<script>
    import {
        timerState,
        startTimer,
        stopTimer,
        clearTimer,
        formatTime,
        setDuration,
        parseTimeInput,
        validateTimeInput,
        MAX_TIMER_DURATION,
        addTimeToTimer,
        setAlarmSound,
        setLoopAlarm,
    } from "$lib/app/appEggTimer.svelte.js";
    import { preferencesState } from "$lib/app/appPreferences.svelte";
    import { Button, Radio, Checkbox } from "svelte-5-ui-lib";
    import { onMount } from "svelte";
    import { _ } from "svelte-i18n";

    // Reference to audio element
    let alarmAudio;

    // List of available alarm sounds
    const alarmSounds = [
        {
            id: "notificationTimer",
            label: "Notification",
            file: "notificationTimer.mp3",
        },
        { id: "spaceTimer", label: "Space", file: "spaceTimer.mp3" },
        { id: "classicTimer", label: "Classic", file: "classicTimer.mp3" },
        { id: "digitalTimer", label: "Digital", file: "digitalTimer.mp3" },
        { id: "bellTimer", label: "Bell", file: "bellTimer.mp3" },
        { id: "sexyGuy", label: "Sexy Guy", file: "sexyGuy.mp3" },
        { id: "sexyLady", label: "Sexy Lady", file: "sexyLady.mp3" },
    ];

    // Calculate gradient percentage based on time remaining
    let gradientPercent = $derived(
        Math.min(
            100,
            Math.max(
                0,
                (timerState.remainingSeconds / timerState.duration) * 100,
            ),
        ),
    );

    // Format the display time
    let displayTime = $derived(formatTime(timerState.remainingSeconds));

    // State for editing mode
    let isEditing = $state(false);
    let inputValue = $state("");
    let inputError = $state("");

    // For manual loop handling if the HTML loop attribute doesn't work
    let audioEnded = $state(false);

    // Check if sound is enabled
    let isSoundEnabled = $derived(preferencesState.eggTimerSound);

    // Handle changing the alarm sound
    function changeAlarmSound(sound) {
        if (!isSoundEnabled) return;

        setAlarmSound(sound);

        // Force audio element to reload with new source
        if (alarmAudio) {
            // We need to set a timeout to ensure the DOM has updated before we reload
            setTimeout(() => {
                alarmAudio.load();
            }, 0);
        }
    }

    // Handle loop checkbox change
    function toggleLoopAlarm(e) {
        if (!isSoundEnabled) return;

        setLoopAlarm(e.target.checked);
    }

    // Initialize audio when component mounts
    onMount(() => {
        if (alarmAudio) {
            // Set up ended event handler for manual looping
            alarmAudio.addEventListener("ended", handleAudioEnded);
        }

        // Monitor timer state to play alarm when it expires
        $effect(() => {
            if (
                timerState.isExpired &&
                !timerState.alarmPlayed &&
                alarmAudio &&
                isSoundEnabled
            ) {
                audioEnded = false; // Reset the flag
                playAlarm();
                // Mark that we've played the alarm for this expiration
                timerState.alarmPlayed = true;
            }
        });

        // Cleanup listener when component unmounts
        return () => {
            if (alarmAudio) {
                alarmAudio.removeEventListener("ended", handleAudioEnded);
            }
        };
    });

    // Handle the audio ended event - for manual looping
    function handleAudioEnded() {
        audioEnded = true;
        if (timerState.loopAlarm && isSoundEnabled) {
            // Replay if looping is enabled
            alarmAudio.currentTime = 0;
            alarmAudio.play().catch((err) => {
                console.error("Failed to loop alarm sound:", err);
            });
        }
    }

    // Play the alarm sound
    function playAlarm() {
        if (alarmAudio && isSoundEnabled) {
            alarmAudio.currentTime = 0; // Reset to start
            alarmAudio.play().catch((err) => {
                console.error("Failed to play alarm sound:", err);
            });
        }
    }

    // Stop the alarm sound
    function stopAlarm() {
        if (alarmAudio && !alarmAudio.paused) {
            alarmAudio.pause();
            alarmAudio.currentTime = 0;
            audioEnded = false;
        }
    }

    // Toggle edit mode and stop alarm if playing
    function toggleEditMode() {
        // Don't allow editing while timer is running
        if (timerState.isRunning) return;

        // Stop the alarm if it's playing
        stopAlarm();

        if (!isEditing) {
            // Start with empty input field for better UX
            inputValue = "";
            inputError = "";
            isEditing = true;
        } else {
            isEditing = false;
        }
    }

    // Handle saving the new time
    function handleTimeInput() {
        if (!inputValue.trim()) {
            isEditing = false;
            return;
        }

        const totalSeconds = parseTimeInput(inputValue);
        const validation = validateTimeInput(totalSeconds);

        if (!validation.valid) {
            inputError = validation.error;
            return;
        }

        // Update timer duration and reset remaining seconds to match
        setDuration(totalSeconds);

        // Exit edit mode
        inputError = "";
        isEditing = false;
    }

    // Handle direct input
    function handleDirectInput(e) {
        inputValue = e.target.value;

        // Clear error on change
        if (inputError) inputError = "";
    }

    // Handle key press in input
    function handleKeyPress(event) {
        if (event.key === "Enter") {
            handleTimeInput();
        } else if (event.key === "Escape") {
            isEditing = false;
            inputError = "";
        }
    }

    // Add time button handlers
    function addThirtySeconds() {
        addTimeToTimer(30);
    }

    function addOneMinute() {
        addTimeToTimer(60);
    }

    function addFiveMinutes() {
        addTimeToTimer(5 * 60);
    }

    function addTenMinutes() {
        addTimeToTimer(10 * 60);
    }

    // Override the clear timer function to also stop the alarm
    function handleClearTimer() {
        clearTimer();
        stopAlarm();
    }
</script>

<div class="flex flex-col md:flex-row md:gap-8 items-start py-8 px-2 md:p-8">
    <!-- Left side with alarm sound selection - Desktop view -->
    <div class="hidden md:block md:w-48 lg:w-64">
        <p class="mb-4 font-semibold text-slate-700">
            {$_("eggTimer.alarmSound")}: <span class="capitalize"
                >{timerState.alarmSound.replace(".mp3", "")}</span
            >
        </p>

        {#if !isSoundEnabled}
            <div
                class="p-3 bg-amber-50 border border-amber-200 rounded-lg mb-4 text-amber-700 text-sm"
            >
                {$_("eggTimer.alarmsDisabled")}
            </div>
        {/if}

        <ul
            class="w-full divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white {!isSoundEnabled
                ? 'opacity-50'
                : ''}"
        >
            {#each alarmSounds as sound}
                <li>
                    <Radio
                        labelClass="p-3"
                        bind:group={timerState.alarmSound}
                        value={sound.file}
                        onclick={() => changeAlarmSound(sound.file)}
                        disabled={!isSoundEnabled}
                    >
                        {sound.label}
                    </Radio>
                </li>
            {/each}
        </ul>

        <!-- Loop checkbox -->
        <div
            class="mt-4 p-3 bg-white border border-gray-200 rounded-lg {!isSoundEnabled
                ? 'opacity-50'
                : ''}"
        >
            <Checkbox
                checked={timerState.loopAlarm}
                onchange={toggleLoopAlarm}
                disabled={!isSoundEnabled}
            >
                {$_("eggTimer.loopAlarm")}
            </Checkbox>
        </div>
    </div>

    <!-- Single hidden audio element for the entire component -->
    {#if isSoundEnabled}
        <audio bind:this={alarmAudio} preload="auto">
            <source src="/{timerState.alarmSound}" type="audio/mpeg" />
            Your browser does not support the audio element.
        </audio>
    {/if}

    <!-- Main timer display -->
    <div
        class="flex flex-col items-center justify-center gap-4 md:gap-8 w-full md:flex-1"
    >
        <!-- Timer display -->
        <div
            class="relative flex items-center justify-center
                   rounded-full border-8 border-slate-300 bg-white
                   w-64 h-64 md:w-80 md:h-80 overflow-hidden shadow-md
                   transition-colors duration-300
                   {!timerState.isRunning
                ? 'cursor-pointer hover:border-amber-300'
                : ''}"
            onclick={toggleEditMode}
        >
            <!-- Timer fill gradient -->
            <div
                class="absolute bottom-0 left-0 right-0 bg-amber-400 z-0 transition-all duration-200 rounded-b-full opacity-50"
                style="height: {gradientPercent}%;"
            ></div>

            <!-- Time display or edit input -->
            {#if isEditing}
                <div
                    class="z-10 p-2 bg-white rounded-lg shadow-inner w-48 flex flex-col items-center"
                >
                    <input
                        value={inputValue}
                        placeholder={displayTime}
                        class="text-4xl font-bold text-center bg-transparent border-2
                               {inputError
                            ? 'border-red-400'
                            : 'border-slate-300'} 
                               rounded-lg w-full p-2"
                        oninput={(e) => handleDirectInput(e)}
                        onkeydown={handleKeyPress}
                        onblur={handleTimeInput}
                        autofocus
                    />
                    <div
                        class="text-xs {inputError
                            ? 'text-red-500'
                            : 'text-slate-500'} text-center mt-1"
                    >
                        {inputError || $_("eggTimer.timeFormatGuide")}
                    </div>
                </div>
            {:else}
                <span
                    class="text-6xl md:text-7xl font-bold z-10 text-slate-800 relative
                           {timerState.isExpired
                        ? 'text-red-600 animate-pulse'
                        : ''}"
                >
                    {displayTime}
                </span>

                {#if !timerState.isRunning}
                    <div
                        class="absolute bottom-6 text-sm text-slate-500 opacity-80"
                    >
                        {isSoundEnabled 
                            ? $_("eggTimer.clickToEditOrStop")
                            : $_("eggTimer.clickToEdit")}
                    </div>
                {/if}
            {/if}
        </div>

        <!-- Quick-add time buttons -->
        <div class="flex flex-wrap justify-center gap-2 w-full max-w-md">
            <button
                onclick={addThirtySeconds}
                class="bg-thistle hover:bg-thistle-700 text-slate-800 px-3 py-1 rounded-full text-sm font-medium
                      transform transition duration-150 hover:-translate-y-1 active:translate-y-0
                      disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                disabled={isEditing}
            >
                +30s
            </button>
            <button
                onclick={addOneMinute}
                class="bg-thistle hover:bg-thistle-700 text-slate-800 px-3 py-1 rounded-full text-sm font-medium
                      transform transition duration-150 hover:-translate-y-1 active:translate-y-0
                      disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                disabled={isEditing}
            >
                +1m
            </button>
            <button
                onclick={addFiveMinutes}
                class="bg-thistle hover:bg-thistle-700 text-slate-800 px-3 py-1 rounded-full text-sm font-medium
                      transform transition duration-150 hover:-translate-y-1 active:translate-y-0
                      disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                disabled={isEditing}
            >
                +5m
            </button>
            <button
                onclick={addTenMinutes}
                class="bg-thistle hover:bg-thistle-700 text-slate-800 px-3 py-1 rounded-full text-sm font-medium
                      transform transition duration-150 hover:-translate-y-1 active:translate-y-0
                      disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                disabled={isEditing}
            >
                +10m
            </button>
        </div>

        <!-- Control buttons -->
        <div class="flex w-full max-w-md gap-4 md:gap-6">
            <Button
                onclick={startTimer}
                disabled={timerState.isRunning ||
                    isEditing ||
                    timerState.isExpired ||
                    timerState.remainingSeconds <= 0}
                class="bg-moss_green hover:bg-moss_green-600 active:bg-moss_green-700 
                  text-white w-1/3 py-6 text-xl font-bold rounded-lg
                  transform transition-all duration-200 
                  hover:shadow-lg hover:-translate-y-1 active:translate-y-0 active:shadow-md
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                size="xl"
            >
                {$_("eggTimer.start")}
            </Button>
            <Button
                onclick={stopTimer}
                disabled={!timerState.isRunning || isEditing}
                class="bg-amber hover:bg-amber-600 active:bg-amber-700
                      text-slate-800 w-1/3 py-6 text-xl font-bold rounded-lg
                      transform transition-all duration-200 
                      hover:shadow-lg hover:-translate-y-1 active:translate-y-0 active:shadow-md
                      disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                size="xl"
            >
                {$_("eggTimer.stop")}
            </Button>

            <Button
                onclick={handleClearTimer}
                disabled={isEditing}
                class="bg-redwood hover:bg-redwood-600 active:bg-redwood-700
                     text-white w-1/3 py-6 text-xl font-bold rounded-lg
                     transform transition-all duration-200 
                     hover:shadow-lg hover:-translate-y-1 active:translate-y-0 active:shadow-md
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                size="xl"
            >
                {$_("eggTimer.reset")}
            </Button>
        </div>

        <!-- Mobile sound selector view - Only shown if sounds are enabled -->
        <div class="mt-6 md:hidden w-full">
            <p class="mb-4 font-semibold text-slate-700">
                {$_("eggTimer.alarmSound")}: <span class="capitalize"
                    >{timerState.alarmSound.replace(".mp3", "")}</span
                >
            </p>

            {#if !isSoundEnabled}
                <div
                    class="p-3 bg-amber-50 border border-amber-200 rounded-lg mb-4 text-amber-700 text-sm"
                >
                    {$_("eggTimer.alarmsDisabled")}
                </div>
            {:else}
                <!-- Grid layout for sound options -->
                <div
                    class="grid grid-cols-2 gap-2 bg-white rounded-lg border border-gray-200 p-2"
                >
                    {#each alarmSounds as sound}
                        <div class="p-1">
                            <Radio
                                name="alarm-sound"
                                labelClass="flex items-center text-sm py-1"
                                bind:group={timerState.alarmSound}
                                value={sound.file}
                                onclick={() => changeAlarmSound(sound.file)}
                                disabled={!isSoundEnabled}
                            >
                                {sound.label}
                            </Radio>
                        </div>
                    {/each}
                </div>

                <!-- Loop checkbox for mobile -->
                <div
                    class="mt-4 p-3 bg-white border border-gray-200 rounded-lg"
                >
                    <Checkbox
                        checked={timerState.loopAlarm}
                        onchange={toggleLoopAlarm}
                        disabled={!isSoundEnabled}
                    >
                        {$_("eggTimer.loopAlarm")}
                    </Checkbox>
                </div>
            {/if}
        </div>
    </div>
</div>