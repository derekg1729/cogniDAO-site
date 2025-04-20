/**
 * Input Validation Utilities
 * 
 * Runtime validation for API request/response data using JSON Schema.
 */

import Ajv from 'ajv';
import schema from '@/schemas/chatrequest.schema.json';
import type { ChatRequest } from '@/schemas/chatrequest';

// Initialize Ajv instance
const ajv = new Ajv();

// Compile validator for ChatRequest
const validate = ajv.compile<ChatRequest>(schema);

/**
 * Validates an input object against the ChatRequest schema
 * 
 * @param input - The object to validate
 * @returns A type predicate indicating if the input matches the ChatRequest schema
 */
export function validateChatRequest(input: unknown): input is ChatRequest {
  return validate(input);
}

/**
 * Creates a valid ChatRequest object from input, with default values applied
 * 
 * @param message - The chat message
 * @param options - Additional options like stream flag
 * @returns A valid ChatRequest object
 */
export function createChatRequest(
  message: string, 
  options?: { stream?: boolean }
): ChatRequest {
  const request: ChatRequest = {
    message,
    stream: options?.stream ?? true
  };
  
  if (!validateChatRequest(request)) {
    throw new Error('Invalid ChatRequest: ' + JSON.stringify(validate.errors));
  }
  
  return request;
} 