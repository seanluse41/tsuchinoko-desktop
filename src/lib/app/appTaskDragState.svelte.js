// src/lib/dragState.svelte.js

export const dragState = $state({
    activeFolderId: null,  // ID of folder currently being dragged over
});

export function setActiveFolderId(id) {
    dragState.activeFolderId = id;
}

export function clearActiveFolderId() {
    dragState.activeFolderId = null;
}