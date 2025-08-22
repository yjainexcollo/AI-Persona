/**
 * TypeScript Type Definitions for AI-Persona Frontend
 *
 * This file contains all the core type definitions used throughout the application.
 * These types ensure type safety and provide clear interfaces for data structures.
 */

/**
 * Persona Interface
 *
 * Represents a persona/character that users can interact with in the application.
 * Each persona has a unique identity with specific traits and characteristics.
 */
export interface Persona {
  /** Unique identifier for the persona */
  id: string;
  /** Display name of the persona */
  name: string;
  /** The actual name of the persona (e.g., "Sarah Chen", "John Smith") */
  personalName?: string;
  /** Role or job title of the persona */
  role?: string;
  /** Department or team the persona belongs to */
  department?: string;
  /** URL or path to the persona's avatar image */
  avatar?: string;
  /** Alternative avatar URL field from backend */
  avatarUrl?: string;
  /** Whether this persona is favourited by the current user */
  isFavourited?: boolean;
  /** Whether the user has started a chat with this persona */
  hasStartChat?: boolean;
  /** Array of personality traits and characteristics */
  traits?: any[];
  /** Timestamp of when the persona was last updated */
  updatedAt?: string;
  /** Detailed description of the persona */
  description?: string;
  /** Persona role from backend */
  personaRole?: string;
  /** About section from backend */
  about?: string;
  /** Core expertise areas */
  coreExpertise?: any;
  /** Communication style */
  communicationStyle?: string;
  /** Pain points */
  painPoints?: any;
  /** Key responsibilities */
  keyResponsibility?: any;
}

/**
 * Filter Option Interface
 *
 * Represents a filter option used in search and filtering components.
 * Used for filtering personas by various criteria like department, role, etc.
 */
export interface FilterOption {
  /** Display label for the filter option */
  label: string;
  /** Value used for filtering logic */
  value: string;
  /** Whether this filter option is currently active */
  active: boolean;
}
