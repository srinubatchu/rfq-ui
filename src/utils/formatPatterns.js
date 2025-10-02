// src/utils/formatPatterns.js

// Convert string to Title Case
export const titleCase = (str) =>
  str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());

// Keep only numbers
export const numbersOnly = (str) => str.replace(/\D/g, "");

// Convert to uppercase
export const upperCase = (str) => str.toUpperCase();

// Convert to lowercase
export const lowerCase = (str) => str.toLowerCase();

export const integersOnly = (str) => {
  // Keep only digits
  let digits = str.replace(/[^0-9]/g, "");

  // Remove leading zeros
  digits = digits.replace(/^0+/, "");

  return digits;
};
