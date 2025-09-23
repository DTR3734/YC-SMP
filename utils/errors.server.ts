// utils/errors.ts

/**
 * A generic error for API-related issues, such as a server returning a 500 status.
 */
export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * An error for when a PEPPOL Participant ID does not conform to the expected 'scheme::value' format.
 */
export class InvalidParticipantIdError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidParticipantIdError';
  }
}

/**
 * An error for when a network request takes too long to complete.
 */
export class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TimeoutError';
  }
}
