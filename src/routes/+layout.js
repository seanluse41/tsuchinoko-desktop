// src/routes/+layout.js
import { redirect } from '@sveltejs/kit';
import { secretManager } from '../requests/appSecretManager';

export const prerender = true;
export const ssr = false;

export async function load({ url }) {
    try {
        await secretManager.initialize();
        const token = await secretManager.getSecret('kintone_access_token');
        const isAuthRoute = ['/login', '/setup'].includes(url.pathname);
        
        // Redirect authenticated users away from auth routes
        if (isAuthRoute && token) {
            throw redirect(307, '/home');
        }
        
        // Redirect unauthenticated users to login except for auth routes
        if (!isAuthRoute && !token) {
            throw redirect(307, '/login');
        }

        return {
            isAuthenticated: !!token
        };
    } catch (error) {
        console.error('Error in layout load function:', error);
        // On error, redirect to login as a safety measure
        if (!url.pathname.startsWith('/login')) {
            throw redirect(307, '/login');
        }
    }
}