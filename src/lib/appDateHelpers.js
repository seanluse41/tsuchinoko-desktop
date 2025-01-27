// src/lib/appDateHelpers.js

export function formatDate(dateStr) {
    if (!dateStr) return 'Not set';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Invalid date';

    return new Intl.DateTimeFormat(navigator.language, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }).format(date);
}

export function getDueText(dueDate) {
    if (!dueDate) return 'No due date';
    const due = new Date(dueDate);
    if (isNaN(due.getTime())) return 'Invalid due date';

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const rtf = new Intl.RelativeTimeFormat(navigator.language, { numeric: 'auto' });
    return rtf.format(diffDays, 'day');
}