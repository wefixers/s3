/**
 * Utility function to convert a timestamp into a {@link Date}.
 *
 * - If less or zero, an error is thrown.
 * - If less or equal than 1e7 (1 with 7 zeros), assumed as expiration time in **seconds**.
 * - If less or equal than 1e10 (1 with 10 zeros), assumed as UNIX Epoch **seconds**.
 * - If less or equal than 1e13 (1 with 13 zeros), assumed as UNIX Epoch **milliseconds**.
 * - If less or equal than 1e16 (1 with 16 zeros), assumed as UNIX Epoch **microseconds**.
 * - In any other case, an error is thrown.
 */
export function epoch(timestamp: number): Date {
  if (timestamp > 0) {
    if (timestamp <= 1e7) {
      const currentTimestamp = Math.floor(Date.now() / 1000)
      const expirationTimestamp = currentTimestamp + timestamp
      return new Date(expirationTimestamp * 1000) // Convert seconds to milliseconds
    }

    if (timestamp <= 1e10) {
      return new Date(timestamp * 1000) // Convert seconds to milliseconds
    }

    if (timestamp <= 1e13) {
      return new Date(timestamp) // Timestamp is already in milliseconds
    }

    if (timestamp <= 1e16) {
      return new Date(Math.floor(timestamp / 1000)) // Convert microseconds to milliseconds
    }
  }

  throw new TypeError('Invalid timestamp')
}

/**
 * A date, a number in seconds, (3600 to indicate 1 hour) or a timestamp, *see the note*.
 *
 * ### Note
 * - Any `string` is parsed with {@link Date.parse()}
 * - If less or zero, an error is thrown.
 * - If less or equal than 1e7 (1 with 7 zeros), assumed as expiration time in **seconds**.
 * - If less or equal than 1e10 (1 with 10 zeros), assumed as UNIX Epoch **seconds**.
 * - If less or equal than 1e13 (1 with 13 zeros), assumed as UNIX Epoch **milliseconds**.
 * - If less or equal than 1e16 (1 with 16 zeros), assumed as UNIX Epoch **microseconds**.
 * - In any other case, an error is thrown.
 *
 * ### Example
 * ```ts
 * {
 *   expiration: 3600 // 1 hour
 *   expiration: Date.now() + (3600 * 1000) // 1 hour
 * }
 * ```
 */
export type Expiration = Date | number

/**
 * A date, a number in seconds, (3600 to indicate 1 hour) or a timestamp, *see the note*.
 *
 * ### Note
 * - Any `string` is parsed with {@link Date.parse()}
 * - If less or zero, an error is thrown.
 * - If less or equal than 1e7 (1 with 7 zeros), assumed as expiration time in **seconds**.
 * - If less or equal than 1e10 (1 with 10 zeros), assumed as UNIX Epoch **seconds**.
 * - If less or equal than 1e13 (1 with 13 zeros), assumed as UNIX Epoch **milliseconds**.
 * - In any other case, an error is thrown.
 *
 * ### Example
 * ```ts
 * {
 *   expiration: 3600 // 1 hour
 *   expiration: Date.now() + (3600 * 1000) // 1 hour
 * }
 * ```
 *
 * {@link Expiration}
 */
export type DefaultExpiration = Expiration | null | undefined

/**
 * Convert a {@link Expiration} into a relative expiration (in seconds) from the current date.
 *
 * ### Note
 * - Any `string` is parsed with {@link Date.parse()}
 * - If less or zero, an error is thrown.
 * - If less or equal than 1e7 (1 with 7 zeros), assumed as expiration time in **seconds**.
 * - If less or equal than 1e10 (1 with 10 zeros), assumed as UNIX Epoch **seconds**.
 * - If less or equal than 1e13 (1 with 13 zeros), assumed as UNIX Epoch **milliseconds**.
 * - In any other case, an error is thrown.
 *
 * ### Example
 * ```ts
 * {
 *   expiresAt: expirationIn(3600) // 1 hour
 *   expiresAt: expirationIn(Date.now() + (3600 * 1000)) // 1 hour
 * }
 * ```
 */
export function expirationIn(expiration: Expiration): number {
  // 1. A number, the most common case goes first!
  if (typeof expiration === 'number') {
    if (expiration > 0) {
      // 1.1. safe number, can be zero and almost surely indicates a relative expiration
      if (expiration <= 1e7) {
        return Math.floor(expiration)
      }

      // 1.2. expiration in seconds
      if (expiration <= 1e10) {
        return Math.floor((expiration * 1000) - Date.now())
      }

      // 1.3. expiration in milliseconds
      if (expiration <= 1e13) {
        // expiration is a future date, subtract the current date in the past
        return Math.floor(expiration - Date.now())
      }
    }

    // this number is ambiguous, NaN or Infinity, we have to reject it!
    throw new TypeError('Invalid expiration')
  }

  // 2. Special case, we have a string!
  if (typeof expiration === 'string') {
    expiration = Date.parse(expiration)
  }

  // 3. A Date
  if (expiration instanceof Date) {
    // get the total milliseconds
    expiration = expiration.getTime()

    // the date is invalid
    if (Number.isNaN(expiration)) {
      throw new TypeError('Invalid expiration')
    }

    return Math.floor((expiration - Date.now()) / 1000)
  }

  throw new TypeError('Invalid expiration')
}
