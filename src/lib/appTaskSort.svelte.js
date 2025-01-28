// src/lib/appTaskSort.svelte.js
import { taskState } from './appTaskManager.svelte.js';

export const sortState = $state({
    currentSort: null,
    direction: null
});

// レコードIDで並び替え（Kintoneのデフォルト順）
function sortByRecordId() {
    taskState.tasks = [...taskState.tasks].sort((a, b) => {
        const idA = parseInt(a.id);
        const idB = parseInt(b.id);
        return idA - idB;
    });
}

// 日付比較
function compareByDate(a, b, field, direction) {
    const dateA = new Date(a[field]);
    const dateB = new Date(b[field]);
    
    if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0;
    if (isNaN(dateA.getTime())) return 1;
    if (isNaN(dateB.getTime())) return -1;
    
    return direction === 'asc' 
        ? dateA.getTime() - dateB.getTime()
        : dateB.getTime() - dateA.getTime();
}

// asc, desc, なしの切り替え
function cycleSortState(field) {
    if (sortState.currentSort === field) {
        if (sortState.direction === 'asc') {
            sortState.direction = 'desc';
        } else if (sortState.direction === 'desc') {
            sortState.currentSort = null;
            sortState.direction = null;
        }
    } else {
        sortState.currentSort = field;
        sortState.direction = 'asc';
    }
}

// タスク作成日で並び替え
export function sortByCreationDate() {
    cycleSortState('created');
    
    if (!sortState.currentSort) {
        // Kintoneのデフォルト順（レコードID順）に戻す
        sortByRecordId();
        return;
    }
    
    taskState.tasks = [...taskState.tasks].sort((a, b) => 
        compareByDate(a, b, 'dateCreated', sortState.direction)
    );
}

// 締切で並び替え
export function sortByDueDate() {
    cycleSortState('due');
    
    if (!sortState.currentSort) {
        // Kintoneのデフォルト順（レコードID順）に戻す
        sortByRecordId();
        return;
    }
    
    taskState.tasks = [...taskState.tasks].sort((a, b) => 
        compareByDate(a, b, 'dateDue', sortState.direction)
    );
}

// State管理
$effect(() => {
    if (sortState.currentSort && taskState.tasks.length > 0) {
        const sortFn = sortState.currentSort === 'created' 
            ? sortByCreationDate 
            : sortByDueDate;
        sortFn();
    }
});