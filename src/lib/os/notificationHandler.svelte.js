// src/lib/os/notificationHandler.svelte.js
import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
  registerActionTypes,
  onAction
} from '@tauri-apps/plugin-notification';
import { platform } from '@tauri-apps/plugin-os';
import { appNavigation } from '$lib/app/appNavigationTracker.svelte.js';

// Keep track of action registration to avoid duplicate registrations
let actionTypesRegistered = false;

// Initialize notification system for mobile platforms
export async function initNotifications() {
  try {
    // Check if we're on mobile
    const currentPlatform = await platform();
    const isMobile = currentPlatform === 'android' || currentPlatform === 'ios';

    // Set up action types for mobile platforms only
    if (isMobile && !actionTypesRegistered) {
      await registerActionTypes([
        {
          id: 'task-notifications',
          actions: [
            {
              id: 'view-tasks',
              title: 'View Tasks',
              foreground: true,
            }
          ],
        },
      ]);

      // Set up action handler
      await onAction((notification) => {
        console.log('Notification action received:', notification);
        appNavigation('/home');
      });

      actionTypesRegistered = true;
    }

    return true;
  } catch (error) {
    console.error('Failed to initialize notifications:', error);
    return false;
  }
}

// Check notification permission and request if needed
async function checkNotificationPermission() {
  let permissionGranted = await isPermissionGranted();

  // Request permission if not already granted
  if (!permissionGranted) {
    const permission = await requestPermission();
    permissionGranted = permission === 'granted';
  }

  return permissionGranted;
}

// Send a notification for a single task
export async function sendSingleNotification(taskId, type, taskData) {
  try {
    // Check permission
    const permissionGranted = await checkNotificationPermission();
    if (!permissionGranted) {
      console.log('Notification permission not granted');
      return false;
    }

    // Get notification content based on type
    let title, body;

    switch (type) {
      case 'becomeOverdue':
        title = 'Task is now overdue';
        body = `"${taskData.name || 'Your task'}" is past its due date.`;
        break;
      default:
        title = 'Task notification';
        body = 'You have a notification about your task.';
    }

    // Check if we're on mobile or desktop
    const currentPlatform = await platform();
    const isMobile = currentPlatform === 'android' || currentPlatform === 'ios';

    // Send notification with appropriate options
    if (isMobile) {
      // On mobile, add action and metadata
      await sendNotification({
        title,
        body,
        actionTypeId: 'task-notifications'
      });
    } else {
      // On desktop, send simple notification
      await sendNotification({
        title,
        body
      });
    }

    return true;
  } catch (error) {
    console.error('Failed to send notification:', error);
    return false;
  }
}

// Send a notification for multiple tasks
export async function sendMultiNotification(taskIds, type, count) {
  try {
    // Check permission
    const permissionGranted = await checkNotificationPermission();
    if (!permissionGranted) {
      console.log('Notification permission not granted');
      return false;
    }

    // Get notification content based on type
    let title, body;

    switch (type) {
      case 'becomeOverdue':
        title = `${count} tasks are now overdue`;
        body = `You have ${count} tasks that need your attention.`;
        break;
      default:
        title = 'Task notification';
        body = `You have ${count} tasks with notifications.`;
    }

    // Check if we're on mobile or desktop
    const currentPlatform = await platform();
    const isMobile = currentPlatform === 'android' || currentPlatform === 'ios';

    // Send notification with appropriate options
    if (isMobile) {
      // On mobile, add action and metadata
      await sendNotification({
        title,
        body,
        actionTypeId: 'task-notifications',
        metadata: { taskIds }
      });
    } else {
      // On desktop, send simple notification
      await sendNotification({
        title,
        body
      });
    }

    return true;
  } catch (error) {
    console.error('Failed to send notification:', error);
    return false;
  }
}