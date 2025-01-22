// src/routes/+layout.js
import { redirect } from '@sveltejs/kit';

export const prerender = true;
export const ssr = false;

export function load({ url }) {
    const token = localStorage.getItem('kintone_access_token');
    const isAuthRoute = ['/login', '/setup'].includes(url.pathname);
    
    // Redirect authenticated users away from auth routes
    if (isAuthRoute && token) {
        throw redirect(307, '/home');
    }
    
    // Redirect unauthenticated users to login except for auth routes
    if (!isAuthRoute && !token) {
        throw redirect(307, '/login');
    }
}