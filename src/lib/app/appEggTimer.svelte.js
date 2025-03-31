// src/lib/app/appEggTimer.svelte.js

// Maximum timer duration in seconds (8 hours)
export const MAX_TIMER_DURATION = 8 * 60 * 60;

// Global timer state
export const timerState = $state({
    duration: 60, // Default 1 minute in seconds
    endTime: null, // When the timer will end
    isRunning: false,
    isExpired: false,
    remainingSeconds: 60,
    intervalId: null,
    alarmPlayed: false, // Track if the alarm has played for the current expiration
    alarmSound: 'digitalTimer.mp3', // Default alarm sound
    loopAlarm: false // Whether to loop the alarm sound
});

// Set the alarm sound
export function setAlarmSound(soundFile) {
    timerState.alarmSound = soundFile;
}

// Set the loop alarm option
export function setLoopAlarm(shouldLoop) {
    timerState.loopAlarm = shouldLoop;
}

// Start the timer with the current duration
export function startTimer() {
    // Don't start if already running
    if (timerState.isRunning) return;
    
    // Calculate end time
    const now = new Date();
    timerState.endTime = new Date(now.getTime() + timerState.remainingSeconds * 1000);
    timerState.isRunning = true;
    timerState.isExpired = false;
    timerState.alarmPlayed = false;
    
    // Start interval
    timerState.intervalId = setInterval(updateTimer, 100); // Check more frequently for smooth display
    updateTimer(); // Call immediately for initial update
}

// Stop the timer without resetting
export function stopTimer() {
    if (!timerState.isRunning) return;
    
    clearInterval(timerState.intervalId);
    timerState.intervalId = null;
    timerState.isRunning = false;
    
    // Save the remaining time
    const now = new Date();
    const remaining = timerState.endTime - now;
    timerState.remainingSeconds = Math.max(0, Math.floor(remaining / 1000));
}

// Clear and reset the timer
export function clearTimer() {
    stopTimer();
    timerState.remainingSeconds = timerState.duration;
    timerState.isExpired = false;
    timerState.alarmPlayed = false;
}

// Set a new duration (in seconds)
export function setDuration(seconds) {
    // Update duration
    timerState.duration = seconds;
    // Reset remaining seconds to match the new duration
    timerState.remainingSeconds = seconds;
    timerState.isExpired = false;
    timerState.alarmPlayed = false;
}

// Add time to the timer (works whether running or not)
export function addTimeToTimer(secondsToAdd) {
    if (secondsToAdd <= 0) return;
    
    // If the timer is expired, restart it
    if (timerState.isExpired) {
        timerState.isExpired = false;
        timerState.alarmPlayed = false;
    }
    
    // Calculate new total time, ensuring we don't exceed max duration
    const newTotalSeconds = Math.min(
        timerState.remainingSeconds + secondsToAdd,
        MAX_TIMER_DURATION
    );
    
    // Update the remaining seconds
    timerState.remainingSeconds = newTotalSeconds;
    
    // Update the duration to match the new total time - THIS IS THE KEY FIX
    timerState.duration = newTotalSeconds;
    
    // If the timer is running, update the end time
    if (timerState.isRunning && timerState.endTime) {
        const now = new Date();
        timerState.endTime = new Date(now.getTime() + timerState.remainingSeconds * 1000);
    }
}

// Update timer display and check for expiration
function updateTimer() {
    if (!timerState.isRunning || !timerState.endTime) return;
    
    const now = new Date();
    const remaining = timerState.endTime - now;
    
    if (remaining <= 0) {
        // Timer expired
        timerState.remainingSeconds = 0;
        timerState.isRunning = false;
        timerState.isExpired = true;
        if (timerState.intervalId) {
            clearInterval(timerState.intervalId);
            timerState.intervalId = null;
        }
    } else {
        // Update remaining time
        timerState.remainingSeconds = Math.floor(remaining / 1000);
    }
}

// Format seconds into MM:SS display
export function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Parse time input in various formats
export function parseTimeInput(input) {
    // Get the raw value directly from input
    const rawInput = input.trim();
    
    if (!rawInput) return null;
    
    // Case 0: Check for time units (h for hours, m for minutes, s for seconds)
    const unitRegex = /^(\d+)(h|m|s)$/i;
    const unitMatch = rawInput.match(unitRegex);
    
    if (unitMatch) {
        const value = parseInt(unitMatch[1], 10);
        const unit = unitMatch[2].toLowerCase();
        
        if (isNaN(value)) return null;
        
        if (unit === 'h') {
            return value * 60 * 60; // hours to seconds
        } else if (unit === 'm') {
            return value * 60; // minutes to seconds
        } else if (unit === 's') {
            return value; // already in seconds
        }
    }
    
    // Case 1: If input is just numbers without colon
    if (!rawInput.includes(':') && /^\d+$/.test(rawInput)) {
        const num = parseInt(rawInput, 10);
        if (isNaN(num)) return null;
        
        if (rawInput.length <= 2) {
            // 1-2 digits: interpret as seconds
            return num;
        } else if (rawInput.length === 3) {
            // 3 digits: interpret as M:SS (e.g., 230 -> 2:30)
            const minutes = parseInt(rawInput.substring(0, 1), 10);
            const seconds = parseInt(rawInput.substring(1), 10);
            return (minutes * 60) + seconds;
        } else if (rawInput.length === 4) {
            // 4 digits: interpret as MM:SS (e.g., 0500 -> 5:00)
            const minutes = parseInt(rawInput.substring(0, 2), 10);
            const seconds = parseInt(rawInput.substring(2), 10);
            if (seconds >= 60) {
                // If seconds invalid, try as total seconds
                return num;
            }
            return (minutes * 60) + seconds;
        } else {
            // Longer: interpret as total seconds
            return num;
        }
    }
    
    // Case 2: MM:SS format
    if (rawInput.includes(':')) {
        const parts = rawInput.split(':');
        if (parts.length !== 2) return null;
        
        const minutes = parseInt(parts[0], 10);
        const seconds = parseInt(parts[1], 10);
        
        if (isNaN(minutes) || isNaN(seconds)) {
            return null;
        }
        
        return (minutes * 60) + seconds;
    }
    
    return null;
}

// Validate a time value (in seconds)
export function validateTimeInput(seconds) {
    if (seconds === null || seconds <= 0) {
        return { valid: false, error: 'Invalid time format' };
    }
    
    if (seconds > MAX_TIMER_DURATION) {
        return { valid: false, error: `Maximum 8 hours` };
    }
    
    return { valid: true, error: null };
}