/**
 * Validation Utilities for Profile Settings
 * Client-side validation for username, email, phone, and password
 */

/**
 * Validate username
 * Requirements: 3-30 characters, alphanumeric and underscores only
 */
export function validateUsername(username: string): { valid: boolean; error?: string } {
  if (!username || username.trim().length === 0) {
    return { valid: false, error: 'Username is required' };
  }

  const trimmed = username.trim();

  if (trimmed.length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters' };
  }

  if (trimmed.length > 30) {
    return { valid: false, error: 'Username must not exceed 30 characters' };
  }

  // Allow alphanumeric, underscores, and hyphens
  const usernamePattern = /^[a-zA-Z0-9_-]+$/;
  if (!usernamePattern.test(trimmed)) {
    return { valid: false, error: 'Username can only contain letters, numbers, underscores, and hyphens' };
  }

  return { valid: true };
}

/**
 * Validate email format
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email || email.trim().length === 0) {
    return { valid: false, error: 'Email is required' };
  }

  const trimmed = email.trim().toLowerCase();
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!emailPattern.test(trimmed)) {
    return { valid: false, error: 'Invalid email format' };
  }

  return { valid: true };
}

/**
 * Validate phone number
 * Flexible format supporting various international formats
 */
export function validatePhone(phone: string): { valid: boolean; error?: string } {
  if (!phone || phone.trim().length === 0) {
    // Phone is optional, so empty is valid
    return { valid: true };
  }

  const trimmed = phone.trim();

  // Remove common phone separators for validation
  const cleaned = trimmed.replace(/[\s\-\(\)\.]/g, '');

  // Check if it's a valid phone number (10-15 digits, optionally starting with +)
  const phonePattern = /^\+?[1-9]\d{9,14}$/;

  if (!phonePattern.test(cleaned)) {
    return { valid: false, error: 'Invalid phone number format. Use international format (e.g., +1234567890)' };
  }

  return { valid: true };
}

/**
 * Validate password strength
 * Requirements: min 8 chars, uppercase, lowercase, number, special char
 */
export function validatePassword(password: string): { valid: boolean; error?: string; strength?: number } {
  if (!password) {
    return { valid: false, error: 'Password is required', strength: 0 };
  }

  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters long', strength: 1 };
  }

  let strength = 1;
  const requirements: string[] = [];

  if (!/[A-Z]/.test(password)) {
    requirements.push('one uppercase letter');
  } else {
    strength++;
  }

  if (!/[a-z]/.test(password)) {
    requirements.push('one lowercase letter');
  } else {
    strength++;
  }

  if (!/\d/.test(password)) {
    requirements.push('one number');
  } else {
    strength++;
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    requirements.push('one special character (!@#$%^&*...)');
  } else {
    strength++;
  }

  if (requirements.length > 0) {
    return {
      valid: false,
      error: `Password must contain at least ${requirements.join(', ')}`,
      strength,
    };
  }

  return { valid: true, strength: 5 };
}

/**
 * Get password strength text
 */
export function getPasswordStrengthText(strength: number): { text: string; color: string } {
  if (strength <= 1) {
    return { text: 'Very Weak', color: 'text-red-500' };
  } else if (strength === 2) {
    return { text: 'Weak', color: 'text-orange-500' };
  } else if (strength === 3) {
    return { text: 'Fair', color: 'text-yellow-500' };
  } else if (strength === 4) {
    return { text: 'Good', color: 'text-green-500' };
  } else {
    return { text: 'Strong', color: 'text-emerald-500' };
  }
}

/**
 * Validate password confirmation
 */
export function validatePasswordConfirmation(
  password: string,
  confirmPassword: string
): { valid: boolean; error?: string } {
  if (!confirmPassword) {
    return { valid: false, error: 'Please confirm your password' };
  }

  if (password !== confirmPassword) {
    return { valid: false, error: 'Passwords do not match' };
  }

  return { valid: true };
}
