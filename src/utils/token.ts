import bcrypt from 'bcrypt';
import crypto from 'crypto';

const SALT_ROUNDS = 10;

/**
 * Utility class for secure token operations
 * Implements refresh token rotation and hashing patterns
 */
export class TokenUtils {
  /**
   * Generate a secure random refresh token
   * @returns Promise<string> - Random token string
   */
  static async generateRefreshToken(): Promise<string> {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Hash a refresh token for database storage
   * @param token - Raw refresh token to hash
   * @returns Promise<string> - Hashed token
   */
  static async hashRefreshToken(token: string): Promise<string> {
    return bcrypt.hash(token, SALT_ROUNDS);
  }

  /**
   * Verify a refresh token against its hash
   * @param token - Raw refresh token to verify
   * @param hashedToken - Hashed token from database
   * @returns Promise<boolean> - Whether token matches hash
   */
  static async verifyRefreshToken(
    token: string,
    hashedToken: string
  ): Promise<boolean> {
    return bcrypt.compare(token, hashedToken);
  }

  /**
   * Generate a token family identifier for rotation tracking
   * @returns string - Unique token family ID
   */
  static generateTokenFamily(): string {
    return crypto.randomUUID();
  }
}
