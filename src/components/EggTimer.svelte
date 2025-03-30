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
        addTimeToTimer
    } from '$lib/app/appEggTimer.svelte.js';
    import { Button } from "svelte-5-ui-lib";
    
    // Calculate gradient percentage based on time remaining
    let gradientPercent = $derived(
        Math.min(100, Math.max(0, (timerState.remainingSeconds / timerState.duration) * 100))
    );
    
    // Format the display time
    let displayTime = $derived(formatTime(timerState.remainingSeconds));
    
    // State for editing mode
    let isEditing = $state(false);
    let inputValue = $state('');
    let inputError = $state('');
    
    // Toggle edit mode
    function toggleEditMode() {
        // Don't allow editing while timer is running
        if (timerState.isRunning) return;
        
        if (!isEditing) {
            // Start with empty input field for better UX
            inputValue = '';
            inputError = '';
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
        inputError = '';
        isEditing = false;
    }
    
    // Handle direct input
    function handleDirectInput(e) {
        inputValue = e.target.value;
        
        // Clear error on change
        if (inputError) inputError = '';
    }
    
    // Handle key press in input
    function handleKeyPress(event) {
        if (event.key === 'Enter') {
            handleTimeInput();
        } else if (event.key === 'Escape') {
            isEditing = false;
            inputError = '';
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
</script>

<div class="flex flex-col items-center justify-center gap-4 md:gap-8 py-8 px-2 md:p-8">
    <!-- Timer display -->
    <div 
        class="relative flex items-center justify-center 
               rounded-full border-8 border-slate-300 bg-white
               w-64 h-64 md:w-80 md:h-80 overflow-hidden shadow-md
               transition-colors duration-300 
               {!timerState.isRunning ? 'cursor-pointer hover:border-slate-700' : ''}"
        onclick={toggleEditMode}
    >
        <!-- Timer fill gradient -->
        <div 
            class="absolute bottom-0 left-0 right-0 bg-amber-400 z-0 transition-all duration-200 rounded-b-full opacity-50"
            style="height: {gradientPercent}%;"
        ></div>
        
        <!-- Time display or edit input -->
        {#if isEditing}
            <div class="z-10 p-2 bg-white rounded-lg shadow-inner w-48 flex flex-col items-center">
                <input
                    value={inputValue}
                    placeholder={displayTime}
                    class="text-4xl font-bold text-center bg-transparent border-2 
                           {inputError ? 'border-red-400' : 'border-slate-300'} 
                           rounded-lg w-full p-2"
                    oninput={(e) => handleDirectInput(e)}
                    onkeydown={handleKeyPress}
                    onblur={handleTimeInput}
                    autofocus
                />
                <div class="text-xs {inputError ? 'text-red-500' : 'text-slate-500'} text-center mt-1">
                    {inputError || `Enter time (8h, 5m, 30s, or MM:SS)`}
                </div>
            </div>
        {:else}
            <span 
                class="text-6xl md:text-7xl font-bold z-10 text-slate-800 relative
                       {timerState.isExpired ? 'text-red-600 animate-pulse' : ''}"
            >
                {displayTime}
            </span>
            
            {#if !timerState.isRunning}
                <div class="absolute bottom-6 text-sm text-slate-500 opacity-80">
                    Click to edit
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
    
    <!-- Control buttons - larger size with Tailwind -->
    <div class="flex w-full max-w-md gap-4 md:gap-6">
        <Button
            onclick={startTimer} 
            disabled={timerState.isRunning || isEditing}
            class="bg-moss_green hover:bg-moss_green-600 active:bg-moss_green-700 
                  text-white w-1/3 py-6 text-xl font-bold rounded-lg
                  transform transition-all duration-200 
                  hover:shadow-lg hover:-translate-y-1 active:translate-y-0 active:shadow-md
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            size="xl"
        >
            Start
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
            Stop
        </Button>
        
        <Button 
            onclick={clearTimer} 
            disabled={isEditing}
            class="bg-redwood hover:bg-redwood-600 active:bg-redwood-700
                 text-white w-1/3 py-6 text-xl font-bold rounded-lg
                 transform transition-all duration-200 
                 hover:shadow-lg hover:-translate-y-1 active:translate-y-0 active:shadow-md
                 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            size="xl"
        >
            Reset
        </Button>
    </div>
</div>