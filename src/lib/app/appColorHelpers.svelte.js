// src/lib/app/appColorHelpers.svelte.js
import { preferencesState } from './appPreferences.svelte';

// Helper function to lighten/darken hex colors
export function adjustColor(color, amount) {
    // Remove # if present
    color = color.replace('#', '');
    
    // Convert to RGB
    let r = parseInt(color.substring(0, 2), 16);
    let g = parseInt(color.substring(2, 4), 16);
    let b = parseInt(color.substring(4, 6), 16);
    
    // Lighten or darken
    r = Math.max(0, Math.min(255, r + amount));
    g = Math.max(0, Math.min(255, g + amount));
    b = Math.max(0, Math.min(255, b + amount));
    
    // Convert back to hex
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Function to get base color based on task status
export function getStatusColor(status) {
    switch (status) {
        case "completed":
            return preferencesState.completedTaskColor;
        case "registered":
            return preferencesState.registeredTaskColor;
        case "overdue":
            return preferencesState.overdueTaskColor;
        default:
            return preferencesState.registeredTaskColor;
    }
}

// Function to get background color based on task state
export function getTaskBackgroundColor(status, isSelected, isDragging) {
    const baseColor = getStatusColor(status);
    
    // If selected, darken by 2 steps
    if (isSelected) {
        if (isDragging) {
            // When dragging a selected card, make it even darker
            return adjustColor(baseColor, -40);
        }
        return adjustColor(baseColor, -30);
    }
    
    return baseColor;
}

// Function to get hover color - one step darker than the current background
export function getTaskHoverColor(status, isSelected, isDragging) {
    const currentColor = getTaskBackgroundColor(status, isSelected, isDragging);
    return adjustColor(currentColor, -30);
}

// Function to get text color
export function getTaskTextColor(isSelected) {
    // Make text more visible on darker backgrounds when selected
    return isSelected ? "#ffffff" : "#334155";
}