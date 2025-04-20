/**
 * ChatRequest Interface
 * 
 * Defines the structure for chat requests between the frontend and API.
 * This file is generated from the backend schema. Do not edit manually.
 */

export interface ChatRequest {
  /**
   * The message text from the user
   */
  message: string;
  
  /**
   * Optional flag to indicate if streaming should be enabled
   */
  stream?: boolean;
} 