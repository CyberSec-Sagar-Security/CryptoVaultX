/**
 * Share API Service
 * Handles file sharing operations with the backend
 */

import { apiRequest } from './api';

export interface ShareRequest {
  fileId: string;
  recipientEmail: string;
  wrappedKey: string;
  accessLevel: 'view' | 'download' | 'edit';
  expiryDate?: string;
  message?: string;
}

export interface ShareResponse {
  id: string;
  fileId: string;
  recipientId: string;
  wrappedKey: string;
  accessLevel: string;
  createdAt: string;
  expiryDate?: string;
}

export interface SharedFile {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  sharedBy: {
    id: string;
    email: string;
    name?: string;
  };
  accessLevel: string;
  sharedAt: string;
  expiryDate?: string;
  wrappedKey: string;
}

/**
 * Get user's public key by email
 */
export async function getUserPublicKey(email: string): Promise<string> {
  const response = await apiRequest(`/users/by-email/${email}/public-key`, {
    method: 'GET',
  });
  return response.publicKey;
}

/**
 * Get user's public key by ID
 */
export async function getUserPublicKeyById(userId: string): Promise<string> {
  const response = await apiRequest(`/users/${userId}/public-key`, {
    method: 'GET',
  });
  return response.publicKey;
}

/**
 * Share a file with another user
 */
export async function shareFile(shareRequest: ShareRequest): Promise<ShareResponse> {
  const response = await apiRequest(`/files/${shareRequest.fileId}/share`, {
    method: 'POST',
    body: JSON.stringify({
      recipientEmail: shareRequest.recipientEmail,
      wrappedKey: shareRequest.wrappedKey,
      accessLevel: shareRequest.accessLevel,
      expiryDate: shareRequest.expiryDate,
      message: shareRequest.message,
    }),
  });
  return response;
}

/**
 * Get files shared with current user
 */
export async function getSharedFiles(): Promise<SharedFile[]> {
  const response = await apiRequest('/shared', {
    method: 'GET',
  });
  return response.files || [];
}

/**
 * Get files shared by current user
 */
export async function getSharedByMe(): Promise<any[]> {
  const response = await apiRequest('/files/shared-by-me', {
    method: 'GET',
  });
  return response.files || [];
}

/**
 * Revoke file share
 */
export async function revokeFileShare(fileId: string, recipientId: string): Promise<void> {
  await apiRequest(`/files/${fileId}/share/${recipientId}`, {
    method: 'DELETE',
  });
}

/**
 * Get file shares (for file owner)
 */
export async function getFileShares(fileId: string): Promise<ShareResponse[]> {
  const response = await apiRequest(`/files/${fileId}/shares`, {
    method: 'GET',
  });
  return response.shares || [];
}
