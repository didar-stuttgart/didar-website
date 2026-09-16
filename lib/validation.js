/**
 * Server-side validation for form submissions
 */

export function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

export function validateRequired(value, minLength = 1, maxLength = 255) {
  if (!value || typeof value !== 'string') {
    return false;
  }

  const trimmed = value.trim();
  return trimmed.length >= minLength && trimmed.length <= maxLength;
}

export function validatePhone(phone) {
  if (!phone) {
    return true; // Optional field
  }

  if (typeof phone !== 'string') {
    return false;
  }

  // Basic validation: 5-20 digits/symbols typical for international numbers
  return phone.length >= 5 && phone.length <= 20;
}

export function validateTelegram(telegramId) {
  if (!telegramId) {
    return true; // Optional field
  }

  if (typeof telegramId !== 'string') {
    return false;
  }

  // Telegram handles start with @ or are numeric user IDs
  const trimmed = telegramId.trim();
  return (trimmed.startsWith('@') && trimmed.length > 1 && trimmed.length <= 32) ||
    /^\d+$/.test(trimmed);
}

export function validateComment(comment) {
  if (!comment) {
    return true; // Optional field
  }

  if (typeof comment !== 'string') {
    return false;
  }

  return comment.length <= 1000;
}

export function validateEventRegistration(data) {
  const errors = [];

  // Required fields
  if (!validateRequired(data.firstName, 1, 100)) {
    errors.push('First name is required (1-100 characters)');
  }

  if (!validateRequired(data.lastName, 1, 100)) {
    errors.push('Last name is required (1-100 characters)');
  }

  if (!validateEmail(data.email)) {
    errors.push('A valid email address is required');
  }

  // Optional fields
  if (data.phone && !validatePhone(data.phone)) {
    errors.push('Phone number is invalid');
  }

  if (data.telegramId && !validateTelegram(data.telegramId)) {
    errors.push('Telegram ID is invalid');
  }

  if (data.comment && !validateComment(data.comment)) {
    errors.push('Comment is too long (max 1000 characters)');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateMembershipApplication(data) {
  const errors = [];

  // Required fields
  if (!validateRequired(data.firstName, 1, 100)) {
    errors.push('First name is required (1-100 characters)');
  }

  if (!validateRequired(data.lastName, 1, 100)) {
    errors.push('Last name is required (1-100 characters)');
  }

  if (!validateEmail(data.email)) {
    errors.push('A valid email address is required');
  }

  // Optional fields
  if (data.phone && !validatePhone(data.phone)) {
    errors.push('Phone number is invalid');
  }

  if (data.telegramId && !validateTelegram(data.telegramId)) {
    errors.push('Telegram ID is invalid');
  }

  if (data.additionalInfo && !validateComment(data.additionalInfo)) {
    errors.push('Additional information is too long (max 1000 characters)');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateContactForm(data) {
  const errors = [];

  if (!validateRequired(data.name, 1, 100)) {
    errors.push('Name is required (1-100 characters)');
  }

  if (!validateEmail(data.email)) {
    errors.push('A valid email address is required');
  }

  if (!validateRequired(data.message, 10, 2000)) {
    errors.push('Message is required (10-2000 characters)');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
