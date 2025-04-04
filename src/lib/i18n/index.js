// src/lib/i18n/index.js
import { browser } from '$app/environment'
import { init, register } from 'svelte-i18n'

const defaultLocale = 'ja'

register('en', () => import('./locales/en.json'))
register('ja', () => import('./locales/ja.json'))

init({
	fallbackLocale: defaultLocale,
	initialLocale: defaultLocale,
})