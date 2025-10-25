import crypto from "crypto";

// Secure random integer generator for cryptographic use
export function getRandomInt(min, max) {
  return crypto.randomInt(min, max);
}