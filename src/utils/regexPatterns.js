// src/utils/regexPatterns.js
export const regexPatterns = {
  alphaNumeric: {
    regex: /^[a-zA-Z0-9]*$/,
    error: "Only letters and numbers allowed",
  },
  name: {
    regex: /^[a-zA-Z0-9 _-]{3,30}$/,
    error: "Must be 3-30 characters, letters, numbers, spaces, _ or -",
  },
  email: {
    regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    error: "Invalid email format",
  },
  password: {
    regex: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/,
    error:
      "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character",
  },
  phone: {
    regex: /^[0-9]{10}$/,
    error: "Phone must be 10 digits",
  },
  decimalUpTo2: {
    regex: /^\d*\.?\d{0,2}$/,
    error: "Only decimal numbers up to 2 digits allowed",
  }
};
