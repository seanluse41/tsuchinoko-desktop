// src/lib/app/linkExtensionHelper.svelte.js

// For simplicity, we'll use a hardcoded secret
// In production, this should be stored securely
const JWT_SECRET = "tsuuchinoko_extension_secret_2024";

// Helper function to base64url encode
function base64UrlEncode(str) {
    return btoa(str)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

// Simple JWT implementation
export async function createToken(payload) {
    // Create JWT header
    const header = {
        alg: "HS256",
        typ: "JWT"
    };
    
    // Encode header and payload
    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));
    
    // Create the signature
    const dataToSign = encodedHeader + "." + encodedPayload;
    const signature = await createSignature(dataToSign, JWT_SECRET);
    
    // Combine all parts to create the JWT
    return `${encodedHeader}.${encodedPayload}.${signature}`;
}

// Signature generation using Web Crypto API
async function createSignature(data, secret) {
    // Convert string to bytes for crypto operations
    const encoder = new TextEncoder();
    const dataBytes = encoder.encode(data);
    const secretBytes = encoder.encode(secret);
    
    // Create a key from the secret
    const key = await crypto.subtle.importKey(
        "raw",
        secretBytes,
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
    );
    
    // Sign the data
    const signature = await crypto.subtle.sign(
        "HMAC",
        key,
        dataBytes
    );
    
    // Convert the signature to base64url
    return base64UrlEncode(String.fromCharCode(...new Uint8Array(signature)));
}

// Calculate expiry date (15 minutes from now)
export function getExpiryDate() {
    const date = new Date();
    date.setMinutes(date.getMinutes() + 15);
    return date.toISOString();
}