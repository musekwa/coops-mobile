import { v4 as uuidv4 } from 'uuid'; // Ensure you have uuid installed: npm install uuid
import { sha256 } from 'js-sha256'; // Ensure you have js-sha256 installed: npm install js-sha256

export const generateUAID = (userId: string): string =>{
  // Device or User Specific Information (for demonstration, using userId)
  const userInfo = userId.substring(0, 5); // Taking a part of the userId for uniqueness

  // Random Component
  const randomComponent = uuidv4().substring(0, 5); // UUID for randomness

  // High-Resolution Timestamp
  const timestamp = Date.now().toString();

  // Combine
  const combined = `${userInfo}-${randomComponent}-${timestamp}`;

  // Hash
  const hash = sha256(combined);

  // Extract a 9-Digit Number
  // Taking the first 9 digits of the hash, converting to a large number, and using modulo to ensure it's 9 digits
  const uaid = parseInt(hash.substring(0, 9), 16) % 1000000000;

  // Ensure it's exactly 9 digits (pad with zeros if necessary)
  return uaid.toString().padStart(9, '0');
}

