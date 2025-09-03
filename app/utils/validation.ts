// Validation utilities for the GradLink application

// Email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone number validation
export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

// Password validation
export const validatePassword = (password: string): boolean => {
  return password.length >= 8;
};

// Name validation
export const validateName = (name: string): boolean => {
  return name.trim().length >= 2 && /^[a-zA-Z\s]+$/.test(name);
};

// URL validation
export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Date validation
export const validateDate = (date: string): boolean => {
  const parsedDate = new Date(date);
  return !isNaN(parsedDate.getTime());
};

// Graduation year validation
export const validateGraduationYear = (year: number): boolean => {
  const currentYear = new Date().getFullYear();
  return year >= 1900 && year <= currentYear + 10;
};

// Form validation
export const validateForm = (
  data: Record<string, any>
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (data.email && !validateEmail(data.email)) {
    errors.push("Invalid email format");
  }

  if (data.phone && !validatePhoneNumber(data.phone)) {
    errors.push("Invalid phone number format");
  }

  if (data.password && !validatePassword(data.password)) {
    errors.push("Password must be at least 8 characters long");
  }

  if (data.name && !validateName(data.name)) {
    errors.push("Name must be at least 2 characters and contain only letters");
  }

  if (data.graduationYear && !validateGraduationYear(data.graduationYear)) {
    errors.push("Invalid graduation year");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// University code validation
export const validateUniversityCode = (code: string): boolean => {
  // Allow alphanumeric characters, hyphens, and underscores
  const universityCodeRegex = /^[a-zA-Z0-9\-_]+$/;
  return (
    universityCodeRegex.test(code) && code.length >= 2 && code.length <= 50
  );
};

// Event capacity validation
export const validateEventCapacity = (capacity: number): boolean => {
  return Number.isInteger(capacity) && capacity > 0 && capacity <= 10000;
};

// Bio/Description validation
export const validateBio = (bio: string): boolean => {
  return bio.length <= 500;
};

// Location validation
export const validateLocation = (location: string): boolean => {
  return location.trim().length >= 2 && location.length <= 100;
};

// ID validation
export const validateId = (id: string): boolean => {
  return /^[a-zA-Z0-9\-_]+$/.test(id) && id.length > 0;
};

// Timestamp validation
export const validateTimestamp = (timestamp: string): boolean => {
  const date = new Date(timestamp);
  return !isNaN(date.getTime());
};

// Event time validation
export const validateEventTime = (
  startTime: string,
  endTime: string
): boolean => {
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return false;
  }

  return start < end;
};

// Enrollment validation
export const validateEnrollment = (
  eventStartTime: string,
  currentEnrolledCount: number,
  capacity: number,
  isAlreadyEnrolled: boolean
): boolean => {
  const eventStart = new Date(eventStartTime);
  const now = new Date();

  // Can't enroll in past events
  if (eventStart <= now) {
    return false;
  }

  // Can't enroll if already enrolled
  if (isAlreadyEnrolled) {
    return false;
  }

  // Can't enroll if event is full
  if (currentEnrolledCount >= capacity) {
    return false;
  }

  return true;
};

// Input sanitization functions
export const sanitizeText = (text: string): string => {
  return text.trim().replace(/[<>]/g, "");
};

export const sanitizeEmail = (email: string): string => {
  return email.trim().toLowerCase();
};

export const sanitizePhoneNumber = (phone: string): string => {
  return phone.replace(/[^\d+\-\(\)\s]/g, "");
};
