// src/lib/app/appDateHelpers.js

// English date formatting
export function formatDateEN(dateStr, translationFn = null) {
    if (!dateStr) return translationFn ? translationFn('dateHelpers.notSet') : 'Not set';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return translationFn ? translationFn('dateHelpers.invalidDate') : 'Invalid date';
    
    return new Intl.DateTimeFormat('en', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }).format(date);
}

export function getDueTextEN(dueDate, translationFn = null) {
    if (!dueDate) return translationFn ? translationFn('dateHelpers.noDueDate') : 'No due date';
    const due = new Date(dueDate);
    if (isNaN(due.getTime())) return translationFn ? translationFn('dateHelpers.invalidDueDate') : 'Invalid due date';

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    return rtf.format(diffDays, 'day');
}

// Japanese date formatting
export function formatDateJA(dateStr, translationFn = null) {
    if (!dateStr) return translationFn ? translationFn('dateHelpers.notSet') : '未設定';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return translationFn ? translationFn('dateHelpers.invalidDate') : '無効な日付';
    
    return new Intl.DateTimeFormat('ja', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }).format(date);
}

export function getDueTextJA(dueDate, translationFn = null) {
    if (!dueDate) return translationFn ? translationFn('dateHelpers.noDueDate') : '期限なし';
    const due = new Date(dueDate);
    if (isNaN(due.getTime())) return translationFn ? translationFn('dateHelpers.invalidDueDate') : '無効な期限';

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const rtf = new Intl.RelativeTimeFormat('ja', { numeric: 'auto' });
    return rtf.format(diffDays, 'day');
}

// Helper to select the right function based on language
export function formatDate(dateStr, translationFn = null, language = 'en') {
    if (language === 'ja') {
        return formatDateJA(dateStr, translationFn);
    }
    return formatDateEN(dateStr, translationFn);
}

export function getDueText(dueDate, translationFn = null, language = 'en') {
    if (language === 'ja') {
        return getDueTextJA(dueDate, translationFn);
    }
    return getDueTextEN(dueDate, translationFn);
}