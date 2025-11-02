/**
 * Share API Service
 * Handles file sharing operations with the backend
 * UPDATED: Now supports username-based sharing with multi-file/multi-user support
 */

import { apiRequest } from './api';

export interface ShareRequest {
  fileId?: string;  // Single file ID (backward compatibility)
  fileIds?: string[];  // Multiple file IDs for batch sharing
  usernames: string[];  // Array of usernames to share with
  permission?: 'full_access' | 'view' | 'download';
}

export interface ShareResponse {
  message: string;
  results?: {
    created: ShareResult[];
    updated: ShareResult[];
    failed: ShareResult[];
    skipped: ShareResult[];
  };
  summary?: {
    created: number;
    updated: number;
    failed: number;
    skipped: number;
  };
}

export interface ShareResult {
  file_id: string;
  filename?: string;
  username?: string;
  grantee_user_id?: number;
  permission?: string;
  error?: string;
  reason?: string;
}

export interface SharedFile {
  share_id: string;
  file_id: string;
  filename: string;
  size_bytes: number;
  content_type: string;
  permission: string;
  shared_at: string;
  file_created_at: string;
  shared_by?: {
    user_id: number;
    username: string;
    name: string;
  };
  shared_with?: {
    user_id: number;
    username: string;
    name: string;
  };
}

export interface SharedFilesResponse {
  view: 'received' | 'sent';
  shared_files: SharedFile[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export interface UserSearchResult {
  id: number;
  username: string;
  name: string;
  email: string;
}

export interface FileShareInfo {
  share_id: string;
  user_id: number;
  username: string;
  name: string;
  permission: string;
  shared_at: string;
}

/**
 * Search for registered users by username
 */
export async function searchUsers(query: string, limit: number = 10): Promise<UserSearchResult[]> {
  const response = await apiRequest(`/users/search?q=${encodeURIComponent(query)}&limit=${limit}`, {
    method: 'GET',
  });
  return response.users || [];
}

/**
 * Share one or more files with one or more users (username-based)
 */
export async function shareFiles(shareRequest: ShareRequest): Promise<ShareResponse> {
  // Support both single and multiple file IDs
  const fileIds = shareRequest.fileIds || (shareRequest.fileId ? [shareRequest.fileId] : []);
  
  if (fileIds.length === 0) {
    throw new Error('At least one file ID is required');
  }
  
  if (!shareRequest.usernames || shareRequest.usernames.length === 0) {
    throw new Error('At least one username is required');
  }
  
  // Use the first file ID as the endpoint (for compatibility)
  // but send all file IDs in the body
  const response = await apiRequest(`/files/${fileIds[0]}/share`, {
    method: 'POST',
    body: JSON.stringify({
      file_ids: fileIds,
      usernames: shareRequest.usernames,
      permission: shareRequest.permission || 'read',
    }),
  });
  
  return response;
}

/**
 * Get files shared with current user (received shares)
 */
export async function getSharedWithMe(page: number = 1, perPage: number = 20): Promise<SharedFilesResponse> {
  const response = await apiRequest(`/shared?view=received&page=${page}&per_page=${perPage}`, {
    method: 'GET',
  });
  return response;
}

/**
 * Get files shared by current user (sent shares)
 */
export async function getSharedByMe(page: number = 1, perPage: number = 20): Promise<SharedFilesResponse> {
  const response = await apiRequest(`/shared?view=sent&page=${page}&per_page=${perPage}`, {
    method: 'GET',
  });
  return response;
}

/**
 * Revoke file share from a specific user
 */
export async function revokeFileShare(fileId: string, granteeUserId: number): Promise<void> {
  await apiRequest(`/files/${fileId}/share/${granteeUserId}`, {
    method: 'DELETE',
  });
}

/**
 * Get list of users who have access to a specific file (owner only)
 */
export async function getFileShares(fileId: string): Promise<FileShareInfo[]> {
  const response = await apiRequest(`/files/${fileId}/shares`, {
    method: 'GET',
  });
  return response.shares || [];
}

/**
 * Get sharing statistics for current user
 */
export async function getSharingStats(): Promise<{
  files_you_shared: number;
  files_shared_with_you: number;
  users_who_shared_with_you: number;
  users_you_shared_with: number;
}> {
  const response = await apiRequest('/shares/stats', {
    method: 'GET',
  });
  return response.stats;
}

