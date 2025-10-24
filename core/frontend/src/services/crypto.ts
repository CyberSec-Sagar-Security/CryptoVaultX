/**
 * CryptoVault Crypto Service
 * Client-side E2E encryption using Web Crypto API
 * AES-256-GCM for file encryption + RSA-OAEP 2048 for key wrapping
 */

export interface UserKeyPair {
  publicKey: CryptoKey;
  privateKey: CryptoKey;
}

export interface EncryptedFile {
  ciphertext: string; // base64
  iv: string; // base64
  authTag?: string; // base64 (included in ciphertext for GCM)
}

export interface WrappedKey {
  wrappedKey: string; // base64
  recipientId: string;
}

// Utility functions for encoding/decoding
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export function stringToArrayBuffer(str: string): ArrayBuffer {
  const encoder = new TextEncoder();
  return encoder.encode(str).buffer;
}

export function arrayBufferToString(buffer: ArrayBuffer): string {
  const decoder = new TextDecoder();
  return decoder.decode(buffer);
}

/**
 * Generate a random AES-256 key for file encryption
 */
export async function generateFileKey(): Promise<CryptoKey> {
  return await crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true, // extractable
    ['encrypt', 'decrypt']
  );
}

/**
 * Generate RSA-OAEP key pair for user
 */
export async function generateUserKeyPair(): Promise<UserKeyPair> {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true, // extractable
    ['wrapKey', 'unwrapKey']
  );

  return {
    publicKey: keyPair.publicKey,
    privateKey: keyPair.privateKey,
  };
}

/**
 * Export public key to PEM format
 */
export async function exportPublicKeyPem(publicKey: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('spki', publicKey);
  const base64 = arrayBufferToBase64(exported);
  
  // Format as PEM
  const pem = `-----BEGIN PUBLIC KEY-----\n${base64.match(/.{1,64}/g)?.join('\n')}\n-----END PUBLIC KEY-----`;
  return pem;
}

/**
 * Import public key from PEM format
 */
export async function importPublicKeyPem(pem: string): Promise<CryptoKey> {
  // Remove PEM headers and whitespace
  const base64 = pem
    .replace(/-----BEGIN PUBLIC KEY-----/, '')
    .replace(/-----END PUBLIC KEY-----/, '')
    .replace(/\s/g, '');
  
  const binary = base64ToArrayBuffer(base64);
  
  return await crypto.subtle.importKey(
    'spki',
    binary,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    true,
    ['wrapKey']
  );
}

/**
 * Export private key to PEM format
 */
export async function exportPrivateKeyPem(privateKey: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('pkcs8', privateKey);
  const base64 = arrayBufferToBase64(exported);
  
  // Format as PEM
  const pem = `-----BEGIN PRIVATE KEY-----\n${base64.match(/.{1,64}/g)?.join('\n')}\n-----END PRIVATE KEY-----`;
  return pem;
}

/**
 * Import private key from PEM format
 */
export async function importPrivateKeyPem(pem: string): Promise<CryptoKey> {
  // Remove PEM headers and whitespace
  const base64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '');
  
  const binary = base64ToArrayBuffer(base64);
  
  return await crypto.subtle.importKey(
    'pkcs8',
    binary,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    true,
    ['unwrapKey']
  );
}

/**
 * Encrypt file using AES-256-GCM
 */
export async function encryptFile(file: File, fileKey: CryptoKey): Promise<EncryptedFile> {
  const fileArrayBuffer = await file.arrayBuffer();
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for GCM

  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    fileKey,
    fileArrayBuffer
  );

  return {
    ciphertext: arrayBufferToBase64(encrypted),
    iv: arrayBufferToBase64(iv.buffer),
  };
}

/**
 * Decrypt file using AES-256-GCM
 */
export async function decryptFile(encryptedFile: EncryptedFile, fileKey: CryptoKey): Promise<ArrayBuffer> {
  const ciphertext = base64ToArrayBuffer(encryptedFile.ciphertext);
  const iv = base64ToArrayBuffer(encryptedFile.iv);

  const decrypted = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    fileKey,
    ciphertext
  );

  return decrypted;
}

/**
 * Wrap file key with recipient's public key
 */
export async function wrapKey(fileKey: CryptoKey, publicKey: CryptoKey): Promise<string> {
  const wrapped = await crypto.subtle.wrapKey(
    'raw',
    fileKey,
    publicKey,
    {
      name: 'RSA-OAEP',
    }
  );

  return arrayBufferToBase64(wrapped);
}

/**
 * Unwrap file key with user's private key
 */
export async function unwrapKey(wrappedKey: string, privateKey: CryptoKey): Promise<CryptoKey> {
  const wrappedKeyBuffer = base64ToArrayBuffer(wrappedKey);

  return await crypto.subtle.unwrapKey(
    'raw',
    wrappedKeyBuffer,
    privateKey,
    {
      name: 'RSA-OAEP',
    },
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt private key for export/backup (password-based)
 */
export async function encryptPrivateKeyExport(privateKey: CryptoKey, password: string): Promise<string> {
  // Derive key from password using PBKDF2
  const passwordBuffer = stringToArrayBuffer(password);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveKey']
  );

  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );

  // Export private key and encrypt it
  const privateKeyRaw = await crypto.subtle.exportKey('pkcs8', privateKey);
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    derivedKey,
    privateKeyRaw
  );

  // Combine salt + iv + encrypted data
  const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(encrypted), salt.length + iv.length);

  return arrayBufferToBase64(combined.buffer);
}

/**
 * Decrypt private key from backup (password-based)
 */
export async function decryptPrivateKeyImport(encryptedPrivateKey: string, password: string): Promise<CryptoKey> {
  const combined = base64ToArrayBuffer(encryptedPrivateKey);
  
  // Extract salt, iv, and encrypted data
  const salt = combined.slice(0, 16);
  const iv = combined.slice(16, 28);
  const encrypted = combined.slice(28);

  // Derive key from password
  const passwordBuffer = stringToArrayBuffer(password);
  
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveKey']
  );

  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );

  // Decrypt private key
  const decrypted = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    derivedKey,
    encrypted
  );

  // Import the decrypted private key
  return await crypto.subtle.importKey(
    'pkcs8',
    decrypted,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    true,
    ['unwrapKey']
  );
}

/**
 * Generate and store user key pair in session storage
 */
export async function initializeUserKeys(): Promise<UserKeyPair> {
  const keyPair = await generateUserKeyPair();
  
  // Store private key in session storage (for this session only)
  const privateKeyPem = await exportPrivateKeyPem(keyPair.privateKey);
  sessionStorage.setItem('privateKey', privateKeyPem);
  
  return keyPair;
}

/**
 * Retrieve private key from session storage
 */
export async function getPrivateKeyFromSession(): Promise<CryptoKey | null> {
  const privateKeyPem = sessionStorage.getItem('privateKey');
  if (!privateKeyPem) {
    return null;
  }
  
  try {
    return await importPrivateKeyPem(privateKeyPem);
  } catch (error) {
    console.error('Failed to import private key from session:', error);
    sessionStorage.removeItem('privateKey');
    return null;
  }
}

/**
 * Clear user keys from session storage
 */
export function clearUserKeys(): void {
  sessionStorage.removeItem('privateKey');
}

/**
 * Download decrypted file to user's device
 */
export function downloadDecryptedFile(data: ArrayBuffer, filename: string, mimeType: string = 'application/octet-stream'): void {
  const blob = new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  URL.revokeObjectURL(url);
}
